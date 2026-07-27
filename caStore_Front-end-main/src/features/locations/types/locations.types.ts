/** Tipos alineados con el backend (API). */

export type LocationType = 'WAREHOUSE' | 'ZONE' | 'AISLE' | 'SHELF' | 'CELL';

export interface LocationApi {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  capacity: number | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithDetailsApi extends LocationApi {
  parentName: string | null;
  parentCode: string | null;
  productCount: number;
  childCount: number;
  occupancy: number;
}

export interface LocationTreeApi extends LocationApi {
  children: LocationTreeApi[];
  productCount: number;
  occupancy: number;
}

/** Respuesta paginada del backend */
export interface PaginatedLocationsResponse {
  data: LocationWithDetailsApi[];
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
  message?: string;
  data: T;
}

/** Parámetros para GET /locations */
export interface GetLocationsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: LocationType;
  parentId?: string | null;
  includeInactive?: boolean;
}

/** DTO creación (POST) */
export interface CreateLocationDto {
  code: string;
  name: string;
  type: LocationType;
  capacity?: number;
  parentId?: string;
}

/** DTO actualización (PATCH) */
export interface UpdateLocationDto {
  name?: string;
  capacity?: number;
}

/** Vista unificada para UI: occupancy como porcentaje y campos opcionales */
export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  capacity?: number | null;
  parentId?: string | null;
  productCount: number;
  occupancyPercent: number;
  childCount?: number;
  parentName?: string | null;
  parentCode?: string | null;
}

/** Nodo de árbol para mapa/selectores (con hijos y ocupación %) */
export interface LocationTreeNode extends Omit<Location, 'childCount' | 'parentName' | 'parentCode'> {
  children: LocationTreeNode[];
}
