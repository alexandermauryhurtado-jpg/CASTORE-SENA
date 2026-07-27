'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { movementsService } from '@/src/services/movements.service';
import type {
  MovementWithDetails,
  GetMovementsParams,
  PaginatedMovementsResponse,
  TodaySummaryResponse,
  DailySummaryItem,
  GetKardexParams,
  KardexResponse,
  CreateMovementDto,
} from '../types/movements.types';
import { MOCK_MOVEMENTS } from '@/src/lib/mock-data';

const MOVEMENTS_QUERY_KEY = ['movements'] as const;
const MOVEMENTS_TODAY_KEY = ['movements', 'today'] as const;
const MOVEMENTS_DAILY_SUMMARY_KEY = ['movements', 'dailySummary'] as const;
const MOVEMENTS_KARDEX_KEY = ['movements', 'kardex'] as const;
const PRODUCTS_QUERY_KEY = ['products'] as const;
const PRODUCT_STATS_QUERY_KEY = ['products', 'stats'] as const;

function listKey(params: GetMovementsParams) {
  return [...MOVEMENTS_QUERY_KEY, 'list', params] as const;
}

function detailKey(id: string) {
  return [...MOVEMENTS_QUERY_KEY, 'detail', id] as const;
}

function kardexKey(productId: string, params: Omit<GetKardexParams, 'productId'>) {
  return [...MOVEMENTS_KARDEX_KEY, productId, params] as const;
}

/** Mock paginado para fallback cuando la API falla. */
function getMockPaginated(params: GetMovementsParams): PaginatedMovementsResponse {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  type MockItem = { id: string; type: string; quantity: number; productId: string; productName: string; createdAt: string; userFullName?: string; sku?: string; documentRef?: string; lotNumber?: string; observations?: string; userId?: string; providerId?: string; providerName?: string; originLocation?: string; destLocation?: string };
  const mockList: MovementWithDetails[] = (MOCK_MOVEMENTS as MockItem[]).map((m) => ({
    id: m.id,
    type: (m.type as MovementWithDetails['type']),
    quantity: m.quantity,
    stockBefore: 0,
    stockAfter: m.quantity,
    lotNumber: m.lotNumber ?? null,
    docReference: m.documentRef ?? null,
    notes: m.observations ?? null,
    unitCost: null,
    totalCost: null,
    productId: m.productId,
    userId: m.userId ?? 'user-1',
    supplierId: m.providerId ?? null,
    fromLocationId: null,
    toLocationId: null,
    createdAt: m.createdAt,
    productName: m.productName,
    productSku: m.sku ?? '',
    categoryName: '',
    supplierName: m.providerName ?? null,
    fromLocationCode: null,
    fromLocationName: m.originLocation ?? null,
    toLocationCode: null,
    toLocationName: m.destLocation ?? null,
    registeredBy: m.userFullName ?? 'Usuario',
  }));
  const total = mockList.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return {
    data: mockList.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    from,
    to,
  };
}

const MOCK_TODAY: TodaySummaryResponse = {
  totalMovements: 0,
  totalEntries: 0,
  totalExits: 0,
  totalValue: 0,
};

const MOCK_DAILY: DailySummaryItem[] = [];

/** Listado paginado con filtros. Fallback a mock si la API falla. */
export function useMovementsList(params: GetMovementsParams = {}) {
  const query = useQuery({
    queryKey: listKey(params),
    queryFn: async (): Promise<PaginatedMovementsResponse> => {
      const result = await movementsService.getMovements(params);
      if (result) return result;
      return getMockPaginated(params);
    },
  });

  const data = query.data;
  const isUsingMock = data !== undefined && query.isFetched && !query.isRefetching
    ? false
    : false;

  return {
    data: data?.data ?? [],
    pagination: data
      ? {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
          nextPage: data.nextPage,
          prevPage: data.prevPage,
          from: data.from,
          to: data.to,
        }
      : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isUsingMock,
  };
}

/** Resumen del día (hoy). Fallback a mock si la API falla. */
export function useMovementsToday() {
  const query = useQuery({
    queryKey: MOVEMENTS_TODAY_KEY,
    queryFn: async (): Promise<TodaySummaryResponse> => {
      const result = await movementsService.getTodaySummary();
      if (result) return result;
      return MOCK_TODAY;
    },
  });

  return {
    summary: query.data ?? MOCK_TODAY,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isUsingMock: query.data !== undefined && query.data.totalMovements === 0 && !query.isLoading,
  };
}

/** Resumen diario (últimos N días). Fallback a mock si la API falla. */
export function useDailySummary(days: number = 7) {
  const query = useQuery({
    queryKey: [...MOVEMENTS_DAILY_SUMMARY_KEY, days] as const,
    queryFn: async (): Promise<DailySummaryItem[]> => {
      const result = await movementsService.getDailySummary(days);
      if (result) return result;
      return MOCK_DAILY;
    },
  });

  return {
    items: query.data ?? MOCK_DAILY,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Kardex por productId. Fallback a mock si la API falla. */
export function useKardex(productId: string | null, params: Omit<GetKardexParams, 'productId'> = {}) {
  const query = useQuery({
    queryKey: kardexKey(productId ?? '', { dateFrom: params.dateFrom, dateTo: params.dateTo, page: params.page, limit: params.limit }),
    queryFn: async (): Promise<KardexResponse> => {
      if (!productId) {
        return { data: [], total: 0, initialStock: 0, finalStock: 0, totalEntries: 0, totalExits: 0 };
      }
      const result = await movementsService.getKardex({ ...params, productId });
      if (result) return result;
      return { data: [], total: 0, initialStock: 0, finalStock: 0, totalEntries: 0, totalExits: 0 };
    },
    enabled: Boolean(productId),
  });

  return {
    data: query.data ?? { data: [], total: 0, initialStock: 0, finalStock: 0, totalEntries: 0, totalExits: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Detalle de un movimiento por ID. Para panel expandible. */
export function useMovementById(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: detailKey(id ?? ''),
    queryFn: async (): Promise<MovementWithDetails | null> => {
      if (!id) return null;
      return movementsService.getMovementById(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  return {
    movement: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Registrar movimiento. Invalida listado de movimientos, hoy, resumen diario, productos y alertas (cache de productos para stock; alertas se regeneran en backend). */
export function useCreateMovement(
  options?: UseMutationOptions<MovementWithDetails | null, Error, CreateMovementDto, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMovementDto) => movementsService.createMovement(dto),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: MOVEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MOVEMENTS_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: MOVEMENTS_DAILY_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_QUERY_KEY });
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: [...MOVEMENTS_KARDEX_KEY, variables.productId] });
      }
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(data, variables, context, undefined as unknown);
    },
    ...options,
  });
}
