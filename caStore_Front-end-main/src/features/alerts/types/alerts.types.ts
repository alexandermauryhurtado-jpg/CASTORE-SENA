export type AlertType = 'LOW_STOCK' | 'EXPIRY_30D' | 'EXPIRY_15D' | 'EXPIRY_7D' | 'OUT_OF_STOCK';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
  id: string;
  type: AlertType;
  status: AlertStatus;
  currentValue: number;
  threshold: number;
  productName: string;
  productSku: string;
  productId: string;
  createdAt: string;
  notes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolvedByName?: string | null;
  categoryName?: string;
  locationCode?: string | null;
  locationName?: string | null;
}

/** Respuesta paginada del backend GET /alerts */
export interface PaginatedAlertsResponse {
  data: Alert[];
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

/** Respuesta GET /alerts/summary */
export interface AlertSummaryApi {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  activeLowStock: number;
  activeExpiry: number;
}

export interface AlertStats {
  total: number;
  active: number;
  lowStock: number;
  expiring: number;
}
