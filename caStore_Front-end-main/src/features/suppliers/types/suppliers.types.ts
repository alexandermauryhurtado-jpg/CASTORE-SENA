/** Tipos alineados con el backend API (suppliers). */

export type SupplierTypeApi = 'NATIONAL' | 'INTERNATIONAL' | 'MANUFACTURER' | 'DISTRIBUTOR';
export type ContributorTypeApi = 'LARGE' | 'COMMON' | 'SIMPLIFIED' | 'NON_CONTRIBUTOR';

export interface SupplierApi {
  id: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  type: SupplierTypeApi;
  contributorType: ContributorTypeApi;
  country: string;
  state: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  paymentTerms: string | null;
  currency: string;
  website: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierWithStatsApi extends SupplierApi {
  totalMovements: number;
  totalUnits: number;
  lastPurchaseDate: string | null;
}

export interface PurchaseHistoryItemApi {
  id: string;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  docReference: string | null;
  lotNumber: string | null;
  createdAt: string;
  productId: string;
  productSku: string;
  productName: string;
  registeredBy: string;
}

export interface GetSuppliersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: SupplierTypeApi;
  contributorType?: ContributorTypeApi;
  city?: string;
  includeInactive?: boolean;
}

export interface GetPurchasesParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginatedSuppliersResponse {
  data: SupplierWithStatsApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    from: number;
    to: number;
  };
}

export interface PaginatedPurchasesResponse {
  data: PurchaseHistoryItemApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    from: number;
    to: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateSupplierDto {
  legalName: string;
  tradeName: string;
  taxId: string;
  type: SupplierTypeApi;
  contributorType: ContributorTypeApi;
  country: string;
  state?: string | null;
  city: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  contactName?: string | null;
  paymentTerms?: string | null;
  currency?: string;
  website?: string | null;
  notes?: string | null;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;
