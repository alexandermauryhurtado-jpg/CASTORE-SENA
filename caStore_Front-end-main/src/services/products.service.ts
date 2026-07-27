import api from '../lib/api';
import type {
  ProductApi,
  ProductStatsApi,
  GetProductsParams,
  PaginatedProductsResponse,
  ApiSuccessResponse,
  CreateProductDto,
  UpdateProductDto,
  UpdateStatusDto,
} from '../features/products/types/products.types';

const BASE = '/products';

/** Backend responde { success, message, data }. Axios devuelve { data: body }. */
function getData<T>(response: { data?: ApiSuccessResponse<T> }): T | null {
  if (!response?.data) return null;
  const d = response.data as ApiSuccessResponse<T>;
  return d.data ?? null;
}

/** Backend paginado responde { success, message, data, pagination }. */
function getPaginated(
  response: { data?: { data?: ProductApi[]; pagination?: PaginatedProductsResponse['pagination'] } }
): PaginatedProductsResponse | null {
  if (!response?.data) return null;
  const body = response.data as {
    data?: ProductApi[];
    pagination?: PaginatedProductsResponse['pagination'];
  };
  if (!body.data || !body.pagination) return null;
  return { data: body.data, pagination: body.pagination };
}

export const productsService = {
  async getProducts(params: GetProductsParams): Promise<PaginatedProductsResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.locationId) searchParams.set('locationId', params.locationId);
    if (params.status) searchParams.set('status', params.status);
    if (params.lowStock === true) searchParams.set('lowStock', 'true');

    const response = await api.get<{ data: ProductApi[]; pagination: PaginatedProductsResponse['pagination'] }>(
      `${BASE}?${searchParams.toString()}`
    );
    return getPaginated(response);
  },

  async getProductById(id: string): Promise<ProductApi | null> {
    const response = await api.get<ApiSuccessResponse<ProductApi>>(`${BASE}/${id}`);
    return getData(response);
  },

  async getStats(): Promise<ProductStatsApi | null> {
    const response = await api.get<ApiSuccessResponse<ProductStatsApi>>(`${BASE}/stats`);
    return getData(response);
  },

  async createProduct(dto: CreateProductDto): Promise<ProductApi | null> {
    const response = await api.post<ApiSuccessResponse<ProductApi>>(BASE, dto);
    return getData(response);
  },

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductApi | null> {
    const response = await api.patch<ApiSuccessResponse<ProductApi>>(`${BASE}/${id}`, dto);
    return getData(response);
  },

  async updateProductStatus(id: string, dto: UpdateStatusDto): Promise<ProductApi | null> {
    const response = await api.patch<ApiSuccessResponse<ProductApi>>(`${BASE}/${id}/status`, dto);
    return getData(response);
  },

  async updateProductImage(id: string, imageUrl: string): Promise<ProductApi | null> {
    const response = await api.patch<ApiSuccessResponse<ProductApi>>(`${BASE}/${id}/image`, { imageUrl });
    return getData(response);
  },
};
