import api from '../lib/api';
import type {
  MovementWithDetails,
  GetMovementsParams,
  PaginatedMovementsResponse,
  TodaySummaryResponse,
  DailySummaryItem,
  GetKardexParams,
  KardexResponse,
  CreateMovementDto,
} from '../features/movements/types/movements.types';

const BASE = '/movements';

/** Backend devuelve el cuerpo directo en response.data; algunos clientes envuelven en { data }. */
function unwrap<T>(response: { data?: { data?: T } | T }): T | null {
  if (response?.data == null) return null;
  const d = response.data as { data?: T };
  if (d && typeof d === 'object' && 'data' in d && d.data !== undefined) return d.data as T;
  return response.data as T;
}

export const movementsService = {
  async getMovements(params: GetMovementsParams = {}): Promise<PaginatedMovementsResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.type && params.type !== 'all') searchParams.set('type', params.type);
    if (params.supplierId) searchParams.set('supplierId', params.supplierId);
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);

    const response = await api.get<PaginatedMovementsResponse>(`${BASE}?${searchParams.toString()}`);
    const result = unwrap(response) ?? response?.data ?? null;
    return result as PaginatedMovementsResponse | null;
  },

  async getMovementById(id: string): Promise<MovementWithDetails | null> {
    const response = await api.get<MovementWithDetails>(`${BASE}/${id}`);
    return (unwrap(response) ?? response?.data ?? null) as MovementWithDetails | null;
  },

  async getTodaySummary(): Promise<TodaySummaryResponse | null> {
    const response = await api.get<TodaySummaryResponse>(`${BASE}/summary/today`);
    return (unwrap(response) ?? response?.data ?? null) as TodaySummaryResponse | null;
  },

  async getDailySummary(days: number = 7): Promise<DailySummaryItem[] | null> {
    const response = await api.get<DailySummaryItem[]>(`${BASE}/summary/daily?days=${days}`);
    return (unwrap(response) ?? response?.data ?? null) as DailySummaryItem[] | null;
  },

  async getKardex(params: GetKardexParams): Promise<KardexResponse | null> {
    const searchParams = new URLSearchParams({ productId: params.productId });
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));

    const response = await api.get<KardexResponse>(`${BASE}/kardex?${searchParams.toString()}`);
    return (unwrap(response) ?? response?.data ?? null) as KardexResponse | null;
  },

  async createMovement(dto: CreateMovementDto): Promise<MovementWithDetails | null> {
    const response = await api.post<MovementWithDetails>(BASE, dto);
    return (unwrap(response) ?? response?.data ?? null) as MovementWithDetails | null;
  },
};
