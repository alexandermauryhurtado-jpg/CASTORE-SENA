/** Tipos alineados con el backend (API). */

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface ProductApi {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currentStock: number;
  minStock: number;
  hasExpiry: boolean;
  expiryDate: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  categoryId: string;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
  categoryPrefix?: string;
  parentCategoryName: string | null;
  locationName: string | null;
  locationCode: string | null;
}

export interface ProductStatsApi {
  totalActive: number;
  totalInactive: number;
  totalDiscontinued: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  /** Valor total del inventario en COP (si el backend lo expone). */
  totalValue?: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  locationId?: string;
  status?: ProductStatus | 'all';
  lowStock?: boolean;
}

export interface PaginatedProductsResponse {
  data: ProductApi[];
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
  success: true;
  message: string;
  data: T;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  currentStock: number;
  minStock: number;
  categoryId: string;
  locationId?: string;
  hasExpiry?: boolean;
  expiryDate?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  minStock?: number;
  categoryId?: string;
  locationId?: string;
  hasExpiry?: boolean;
  expiryDate?: string;
}

export interface UpdateStatusDto {
  status: ProductStatus;
}
