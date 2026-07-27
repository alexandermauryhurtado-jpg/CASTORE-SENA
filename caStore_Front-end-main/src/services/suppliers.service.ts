import api from '../lib/api';
import type {
  SupplierWithStatsApi,
  PurchaseHistoryItemApi,
  GetSuppliersParams,
  GetPurchasesParams,
  PaginatedSuppliersResponse,
  PaginatedPurchasesResponse,
  ApiSuccessResponse,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '../features/suppliers/types/suppliers.types';

const BASE = '/suppliers';

function getData<T>(response: { data?: ApiSuccessResponse<T> }): T | null {
  if (!response?.data) return null;
  const d = response.data as ApiSuccessResponse<T>;
  return d.data ?? null;
}

function getPaginatedSuppliers(
  response: { data?: { data?: SupplierWithStatsApi[]; pagination?: PaginatedSuppliersResponse['pagination'] } }
): PaginatedSuppliersResponse | null {
  if (!response?.data) return null;
  const body = response.data as {
    data?: SupplierWithStatsApi[];
    pagination?: PaginatedSuppliersResponse['pagination'];
  };
  if (!body.data || !body.pagination) return null;
  return { data: body.data, pagination: body.pagination };
}

function getPaginatedPurchases(
  response: { data?: { data?: PurchaseHistoryItemApi[]; pagination?: PaginatedPurchasesResponse['pagination'] } }
): PaginatedPurchasesResponse | null {
  if (!response?.data) return null;
  const body = response.data as {
    data?: PurchaseHistoryItemApi[];
    pagination?: PaginatedPurchasesResponse['pagination'];
  };
  if (!body.data || !body.pagination) return null;
  return { data: body.data, pagination: body.pagination };
}

export const suppliersService = {
  async getSuppliers(params: GetSuppliersParams = {}): Promise<PaginatedSuppliersResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.type) searchParams.set('type', params.type);
    if (params.contributorType) searchParams.set('contributorType', params.contributorType);
    if (params.city) searchParams.set('city', params.city);
    if (params.includeInactive === true) searchParams.set('includeInactive', 'true');

    const response = await api.get<{
      data: SupplierWithStatsApi[];
      pagination: PaginatedSuppliersResponse['pagination'];
    }>(`${BASE}?${searchParams.toString()}`);
    return getPaginatedSuppliers(response);
  },

  async getSupplierById(id: string): Promise<SupplierWithStatsApi | null> {
    const response = await api.get<ApiSuccessResponse<SupplierWithStatsApi>>(`${BASE}/${id}`);
    return getData(response);
  },

  async getPurchaseHistory(
    id: string,
    params: GetPurchasesParams = {}
  ): Promise<PaginatedPurchasesResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params.search) searchParams.set('search', params.search);

    const response = await api.get<{
      data: PurchaseHistoryItemApi[];
      pagination: PaginatedPurchasesResponse['pagination'];
    }>(`${BASE}/${id}/purchases?${searchParams.toString()}`);
    return getPaginatedPurchases(response);
  },

  /** Comprueba si ya existe un proveedor con el NIT dado (para validación en formulario). */
  async checkTaxIdExists(taxId: string, excludeId?: string): Promise<boolean> {
    const normalized = taxId.trim().replace(/\D/g, '');
    if (!normalized) return false;
    const result = await this.getSuppliers({ search: normalized, limit: 5, page: 1 });
    if (!result?.data?.length) return false;
    return result.data.some(
      (s) => s.taxId.replace(/\D/g, '') === normalized && s.id !== excludeId
    );
  },

  async createSupplier(dto: CreateSupplierDto): Promise<SupplierWithStatsApi | null> {
    const response = await api.post<ApiSuccessResponse<SupplierWithStatsApi>>(BASE, dto);
    return getData(response);
  },

  async updateSupplier(id: string, dto: UpdateSupplierDto): Promise<SupplierWithStatsApi | null> {
    const response = await api.patch<ApiSuccessResponse<SupplierWithStatsApi>>(`${BASE}/${id}`, dto);
    return getData(response);
  },

  async deleteSupplier(id: string): Promise<void | null> {
    const response = await api.delete<ApiSuccessResponse<null>>(`${BASE}/${id}`);
    if (!response?.data) return null;
    return undefined;
  },
};
