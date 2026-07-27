'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { alertsService, type GetAlertsParams } from '@/src/services/alerts.service';
import type { Alert, AlertSummaryApi, PaginatedAlertsResponse } from '../types/alerts.types';
import { MOCK_ALERTS } from '@/src/lib/mock-data';

const ALERTS_KEY = ['alerts'] as const;
const ALERTS_SUMMARY_KEY = ['alerts', 'summary'] as const;

function alertsListKey(params: GetAlertsParams) {
  return [...ALERTS_KEY, 'list', params] as const;
}

function alertDetailKey(id: string) {
  return [...ALERTS_KEY, 'detail', id] as const;
}

const REFETCH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

function getMockPaginatedAlerts(params: GetAlertsParams): PaginatedAlertsResponse {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const type = params.type ?? 'all';
  const status = params.status ?? 'all';

  let list: Alert[] = MOCK_ALERTS.map((a) => ({
    id: a.id,
    type: a.type as Alert['type'],
    status: a.status as Alert['status'],
    currentValue: a.currentValue,
    threshold: a.threshold,
    productName: a.productName,
    productSku: a.productSku,
    productId: a.productId,
    createdAt: a.createdAt,
  }));

  if (type !== 'all') {
    list = list.filter((a) => a.type === type);
  }
  if (status !== 'all') {
    list = list.filter((a) => a.status === status);
  }

  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(page * limit, total);
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
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

function getMockSummary(): AlertSummaryApi {
  const active = MOCK_ALERTS.filter((a) => a.status === 'ACTIVE').length;
  const activeLowStock = MOCK_ALERTS.filter(
    (a) => a.status === 'ACTIVE' && (a.type === 'LOW_STOCK' || a.type === 'OUT_OF_STOCK')
  ).length;
  const activeExpiry = MOCK_ALERTS.filter(
    (a) => a.status === 'ACTIVE' && a.type.startsWith('EXPIRY')
  ).length;
  return {
    total: MOCK_ALERTS.length,
    active,
    resolved: 0,
    dismissed: 0,
    activeLowStock,
    activeExpiry,
  };
}

export interface AlertsListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  from: number;
  to: number;
}

export type AlertsListResult = PaginatedAlertsResponse & { _fromMock?: boolean };

/** Listado paginado con filtros (tipo, estado). Fallback a mock. refetchInterval 2 min. */
export function useAlertsList(
  params: GetAlertsParams = {},
  options?: Pick<UseQueryOptions<AlertsListResult, Error>, 'enabled'>
) {
  const query = useQuery({
    queryKey: alertsListKey(params),
    queryFn: async (): Promise<AlertsListResult> => {
      const result = await alertsService.getAlerts(params);
      if (result) return { ...result, _fromMock: false };
      return { ...getMockPaginatedAlerts(params), _fromMock: true };
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    enabled: options?.enabled ?? true,
  });

  const data = query.data;
  const pagination: AlertsListPagination | null = data
    ? {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
        from: data.from,
        to: data.to,
      }
    : null;

  return {
    alerts: data?.data ?? [],
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refresh: query.refetch,
    isUsingMock: data?._fromMock === true,
    isEmpty: (data?.data?.length ?? 0) === 0 && !query.isLoading,
  };
}

export type AlertSummaryResult = AlertSummaryApi & { _fromMock?: boolean };

/** Resumen GET /alerts/summary. Fallback a mock. refetchInterval 2 min. */
export function useAlertsSummary(
  options?: Pick<UseQueryOptions<AlertSummaryResult, Error>, 'enabled'>
) {
  const query = useQuery({
    queryKey: ALERTS_SUMMARY_KEY,
    queryFn: async (): Promise<AlertSummaryResult> => {
      const result = await alertsService.getSummary();
      if (result) return { ...result, _fromMock: false };
      return { ...getMockSummary(), _fromMock: true };
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    enabled: options?.enabled ?? true,
  });

  const summary: AlertSummaryApi = query.data
    ? { total: query.data.total, active: query.data.active, resolved: query.data.resolved, dismissed: query.data.dismissed, activeLowStock: query.data.activeLowStock, activeExpiry: query.data.activeExpiry }
    : getMockSummary();
  return {
    summary,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
    isUsingMock: query.data?._fromMock === true,
    activeCount: summary.active,
  };
}

/** Detalle GET /alerts/:id. Fallback a mock si existe en MOCK_ALERTS. */
export function useAlertById(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: alertDetailKey(id ?? ''),
    queryFn: async (): Promise<Alert | null> => {
      if (!id) return null;
      const result = await alertsService.getById(id);
      if (result) return result;
      const mock = MOCK_ALERTS.find((a) => a.id === id);
      if (mock) {
        return {
          id: mock.id,
          type: mock.type as Alert['type'],
          status: mock.status as Alert['status'],
          currentValue: mock.currentValue,
          threshold: mock.threshold,
          productName: mock.productName,
          productSku: mock.productSku,
          productId: mock.productId,
          createdAt: mock.createdAt,
        };
      }
      return null;
    },
    enabled: (options?.enabled ?? true) && !!id,
  });

  return {
    alert: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
    isUsingMock: query.isError === true,
  };
}

/** Mutación resolver: PATCH /alerts/:id/resolve. Invalida listado y summary. */
export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      alertsService.resolve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      queryClient.invalidateQueries({ queryKey: ALERTS_SUMMARY_KEY });
    },
  });
}

/** Mutación descartar: PATCH /alerts/:id/dismiss. Invalida listado y summary. */
export function useDismissAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      alertsService.dismiss(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
      queryClient.invalidateQueries({ queryKey: ALERTS_SUMMARY_KEY });
    },
  });
}

/** Hook unificado para la página de alertas: listado por defecto (skeleton, empty, error). */
export function useAlerts() {
  const list = useAlertsList({ page: 1, limit: 10, type: 'all', status: 'all' });
  return {
    alerts: list.alerts,
    isLoading: list.isLoading,
    isUsingMock: list.isUsingMock,
    error: list.error instanceof Error ? list.error.message : list.error != null ? String(list.error) : null,
    refresh: list.refresh,
    isEmpty: list.isEmpty,
  };
}
