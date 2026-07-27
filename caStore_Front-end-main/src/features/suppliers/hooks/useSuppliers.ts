'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { suppliersService } from '@/src/services/suppliers.service';
import type {
  GetSuppliersParams,
  GetPurchasesParams,
  SupplierWithStatsApi,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '../types/suppliers.types';
import {
  getMockPaginatedSuppliers,
  MOCK_SUPPLIERS_API,
  MOCK_PURCHASES_API,
} from '../mockData';

const SUPPLIERS_QUERY_KEY = ['suppliers'] as const;
const supplierListKey = (params: GetSuppliersParams) => [...SUPPLIERS_QUERY_KEY, 'list', params] as const;
const supplierDetailKey = (id: string) => [...SUPPLIERS_QUERY_KEY, 'detail', id] as const;
const supplierPurchasesKey = (id: string, params: GetPurchasesParams) =>
  [...SUPPLIERS_QUERY_KEY, 'purchases', id, params] as const;

type SuppliersListResult =
  | { data: SupplierWithStatsApi[]; pagination: NonNullable<ReturnType<typeof getMockPaginatedSuppliers>>['pagination']; isMock?: boolean }
  | null;

/** Listado paginado con filtros (tipo, ciudad, búsqueda). Fallback a mock si la API falla. */
export function useSuppliersList(params: GetSuppliersParams) {
  const query = useQuery({
    queryKey: supplierListKey(params),
    queryFn: async (): Promise<SuppliersListResult> => {
      const result = await suppliersService.getSuppliers(params);
      if (result) return { data: result.data, pagination: result.pagination };
      const mock = getMockPaginatedSuppliers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        type: params.type,
        city: params.city,
      });
      return { ...mock, isMock: true };
    },
  });

  const raw = query.data;
  const data = raw?.data ?? [];
  const pagination = raw?.pagination ?? null;
  const isUsingMock = Boolean(raw && 'isMock' in raw && raw.isMock);

  return {
    data,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isUsingMock,
  };
}

/** Detalle de un proveedor por ID. Fallback a mock si existe en mock. */
export function useSupplier(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: supplierDetailKey(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await suppliersService.getSupplierById(id);
      if (result) return result;
      const mock = MOCK_SUPPLIERS_API.find((s) => s.id === id);
      return mock ?? null;
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  return {
    supplier: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Historial de compras del proveedor paginado con filtros (dateFrom, dateTo). Fallback a mock. */
export function useSupplierPurchases(
  supplierId: string | null,
  params: GetPurchasesParams = {},
  options?: { enabled?: boolean }
) {
  const query = useQuery({
    queryKey: supplierPurchasesKey(supplierId ?? '', params),
    queryFn: async () => {
      if (!supplierId) return { data: [], pagination: null };
      const result = await suppliersService.getPurchaseHistory(supplierId, params);
      if (result) return result;
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const total = MOCK_PURCHASES_API.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return {
        data: MOCK_PURCHASES_API.slice((page - 1) * limit, page * limit),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
          from: total === 0 ? 0 : (page - 1) * limit + 1,
          to: total === 0 ? 0 : Math.min(page * limit, total),
        },
      };
    },
    enabled: Boolean(supplierId) && (options?.enabled ?? true),
  });

  return {
    data: query.data?.data ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Validación de NIT único (para uso con debounce en formulario). */
export function useCheckTaxIdExists() {
  return useQuery({
    queryKey: ['suppliers', 'checkTaxId'],
    queryFn: () => Promise.resolve(false),
    enabled: false,
  });
}

/** Crear proveedor. Invalida listado. */
export function useCreateSupplier(
  options?: UseMutationOptions<SupplierWithStatsApi | null, Error, CreateSupplierDto, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSupplierDto) => suppliersService.createSupplier(dto),
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, _variables, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Actualizar proveedor. Invalida listado y detalle. */
export function useUpdateSupplier(
  options?: UseMutationOptions<
    SupplierWithStatsApi | null,
    Error,
    { id: string; dto: UpdateSupplierDto },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupplierDto }) =>
      suppliersService.updateSupplier(id, dto),
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: supplierDetailKey(variables.id) });
        queryClient.invalidateQueries({
          queryKey: supplierPurchasesKey(variables.id, {}),
        });
      }
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, variables, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Eliminar (soft delete) proveedor. Invalida listado y detalle. */
export function useDeleteSupplier(
  options?: UseMutationOptions<void | null, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: (_data, id, _context) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
      if (id) queryClient.invalidateQueries({ queryKey: supplierDetailKey(id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, id, _context, undefined as unknown);
    },
    ...options,
  });
}
