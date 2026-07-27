'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import { productsService } from '@/src/services/products.service';

import type {
  GetProductsParams,
  ProductApi,
  ProductStatsApi,
  PaginatedProductsResponse,
  CreateProductDto,
  UpdateProductDto,
  UpdateStatusDto,
} from '../types/products.types';
import {
  productApiToView,
  mockProducts,
  getMockPaginatedProducts,
  MOCK_PRODUCT_STATS,
  type Product,
} from '../mockData';

const PRODUCTS_QUERY_KEY = ['products'] as const;
const PRODUCT_STATS_QUERY_KEY = ['products', 'stats'] as const;

const ONE_MINUTE_MS = 60 * 1000;
const TWO_MINUTES_MS = 2 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

function productListKey(params: GetProductsParams) {
  return [...PRODUCTS_QUERY_KEY, params] as const;
}

function productDetailKey(id: string) {
  return ['products', 'detail', id] as const;
}

interface ListQueryResult {
  result: PaginatedProductsResponse;
  isUsingMock: boolean;
}

/** Listado paginado con filtros. Fallback a mock si el servicio no responde. Cache 1 minuto. */
export function useProductsList(params: GetProductsParams) {
  const query = useQuery({
    queryKey: productListKey(params),
    queryFn: async (): Promise<ListQueryResult> => {
      try {
        const result = await productsService.getProducts(params);
        if (result) return { result, isUsingMock: false };
        return { result: getMockPaginatedProducts(params), isUsingMock: true };
      } catch {
        return { result: getMockPaginatedProducts(params), isUsingMock: true };
      }
    },
    staleTime: ONE_MINUTE_MS,
  });

  const raw = query.data;
  const result = raw?.result ?? null;
  const viewData: Product[] = result ? result.data.map(productApiToView) : [];
  const pagination = result?.pagination ?? null;

  return {
    data: viewData,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isUsingMock: raw?.isUsingMock ?? false,
  };
}

/** Estadísticas de productos. Fallback a mock si falla. Cache 2 minutos. */
export function useProductStats(
  options?: Pick<UseQueryOptions<ProductStatsApi, Error, ProductStatsApi>, 'enabled'>
) {
  const query = useQuery({
    queryKey: PRODUCT_STATS_QUERY_KEY,
    queryFn: async (): Promise<ProductStatsApi> => {
      const result = await productsService.getStats();
      return result ?? MOCK_PRODUCT_STATS;
    },
    staleTime: TWO_MINUTES_MS,
    enabled: options?.enabled ?? true,
  });

  const stats: ProductStatsApi = query.data ?? MOCK_PRODUCT_STATS;
  const isUsingMock =
    query.data !== undefined &&
    query.data.totalActive === MOCK_PRODUCT_STATS.totalActive &&
    query.data.lowStockCount === MOCK_PRODUCT_STATS.lowStockCount &&
    !query.isFetching;

  return {
    stats,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isUsingMock,
  };
}

/** Detalle de un producto por ID. Habilitado solo con ID. Cache 5 minutos. */
export function useProduct(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: productDetailKey(id ?? ''),
    queryFn: async (): Promise<ProductApi | null> => {
      if (!id) return null;
      const result = await productsService.getProductById(id);
      if (result) return result;
      const mock = mockProducts.find((p) => p.id === id);
      if (mock) {
        return {
          id: mock.id,
          sku: mock.sku,
          name: mock.name,
          description: mock.description ?? null,
          price: mock.price,
          currentStock: mock.stock,
          minStock: mock.minStock,
          hasExpiry: mock.hasExpiration ?? false,
          expiryDate: mock.expirationDate ?? null,
          status: (mock.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'),
          imageUrl: mock.image,
          categoryId: '',
          locationId: mock.locationId ?? null,
          createdAt: mock.createdAt,
          updatedAt: mock.createdAt,
          categoryName: mock.categoryName,
          categoryPrefix: undefined,
          parentCategoryName: mock.parentCategoryName ?? null,
          locationName: null,
          locationCode: null,
        } as ProductApi;
      }
      return null;
    },
    staleTime: FIVE_MINUTES_MS,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  return {
    product: query.data ? productApiToView(query.data) : null,
    productApi: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Crear producto. Invalida listado y stats. */
export function useCreateProduct(
  options?: UseMutationOptions<ProductApi | null, Error, CreateProductDto, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.createProduct(dto),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_QUERY_KEY });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(
        data,
        variables,
        context,
        undefined as unknown
      );
    },
    ...options,
  });
}

/** Actualizar producto. Invalida listado, stats y detalle. */
export function useUpdateProduct(
  options?: UseMutationOptions<
    ProductApi | null,
    Error,
    { id: string; dto: UpdateProductDto },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productsService.updateProduct(id, dto),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: productDetailKey(variables.id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(
        data,
        variables,
        context,
        undefined as unknown
      );
    },
    ...options,
  });
}

/** Cambiar estado. Invalida listado, stats y detalle. */
export function useUpdateProductStatus(
  options?: UseMutationOptions<
    ProductApi | null,
    Error,
    { id: string; status: UpdateStatusDto['status'] },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UpdateStatusDto['status'] }) =>
      productsService.updateProductStatus(id, { status }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: productDetailKey(variables.id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(
        data,
        variables,
        context,
        undefined as unknown
      );
    },
    ...options,
  });
}

/** Actualizar imagen. Invalida detalle y listado. */
export function useUpdateProductImage(
  options?: UseMutationOptions<ProductApi | null, Error, { id: string; imageUrl: string }, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) =>
      productsService.updateProductImage(id, imageUrl),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: productDetailKey(variables.id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(
        data,
        variables,
        context,
        undefined as unknown
      );
    },
    ...options,
  });
}
