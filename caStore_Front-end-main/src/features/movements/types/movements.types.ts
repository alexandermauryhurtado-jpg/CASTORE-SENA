/** Tipos de movimiento alineados con el backend (API). */
export type MovementTypeApi =
  | 'PURCHASE_ENTRY'
  | 'SALE_EXIT'
  | 'TRANSFER'
  | 'POSITIVE_ADJUSTMENT'
  | 'NEGATIVE_ADJUSTMENT'
  | 'RETURN';

export interface MovementWithDetails {
  id: string;
  type: MovementTypeApi;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  lotNumber: string | null;
  docReference: string | null;
  notes: string | null;
  unitCost: number | null;
  totalCost: number | null;
  productId: string;
  userId: string;
  supplierId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  createdAt: string;
  productName: string;
  productSku: string;
  categoryName: string;
  supplierName: string | null;
  fromLocationCode: string | null;
  fromLocationName: string | null;
  toLocationCode: string | null;
  toLocationName: string | null;
  registeredBy: string;
}

export interface GetMovementsParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  type?: MovementTypeApi | 'all';
  supplierId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedMovementsResponse {
  data: MovementWithDetails[];
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
}

export interface TodaySummaryResponse {
  totalMovements: number;
  totalEntries: number;
  totalExits: number;
  totalValue: number;
}

export interface DailySummaryItem {
  date: string;
  totalEntries: number;
  totalExits: number;
  totalMovements: number;
}

export interface KardexItem {
  date: string;
  type: string;
  docReference: string | null;
  lotNumber: string | null;
  entries: number;
  exits: number;
  balance: number;
  unitCost: number | null;
  totalCost: number | null;
  balanceValue: number | null;
  registeredBy: string;
}

export interface GetKardexParams {
  productId: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface KardexResponse {
  data: KardexItem[];
  total: number;
  initialStock: number;
  finalStock: number;
  totalEntries: number;
  totalExits: number;
}

export interface CreateMovementDto {
  type: MovementTypeApi;
  productId: string;
  quantity: number;
  lotNumber?: string;
  docReference?: string;
  notes?: string;
  unitCost?: number;
  supplierId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  createdAt?: string;
}

/** Compatibilidad con listado que espera "Movement" (nombre corto). */
export type Movement = MovementWithDetails;
