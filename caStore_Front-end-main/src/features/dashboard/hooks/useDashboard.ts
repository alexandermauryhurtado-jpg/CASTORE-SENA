'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/dashboard.service';
import type { DashboardData } from '../types/dashboard.types';
import { MOCK_DASHBOARD } from '../../../lib/mock-data';

const QUERY_KEY = ['dashboard'] as const;
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

function isEmptyDashboard(d: DashboardData): boolean {
  const hasKpis = (d.kpis?.products?.total ?? 0) > 0 || (d.kpis?.movements?.totalToday ?? 0) > 0 || (d.kpis?.alerts?.active ?? 0) > 0;
  const hasCharts = (d.charts?.movementsByDay?.length ?? 0) > 0 || (d.charts?.stockByCategory?.length ?? 0) > 0;
  const hasWidgets =
    (d.widgets?.recentAlerts?.length ?? 0) > 0 || (d.widgets?.recentProducts?.length ?? 0) > 0;
  return !hasKpis && !hasCharts && !hasWidgets;
}

export function useDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<DashboardData> => {
      const result = await dashboardService.getDashboard();
      if (result === null) {
        throw new Error('El servicio no devolvió datos');
      }
      return result;
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    placeholderData: undefined,
    retry: 1,
  });

  const isUsingMock = isError;
  const displayData: DashboardData | undefined = isError ? MOCK_DASHBOARD : (data ?? undefined);
  const isEmpty = displayData ? isEmptyDashboard(displayData) : false;
  const errorMessage = error instanceof Error ? error.message : 'Error al cargar el dashboard';

  return {
    data: displayData,
    isLoading: isLoading && !data,
    error: isError ? errorMessage : null,
    isUsingMock,
    isEmpty,
    refresh: refetch,
    isRefetching: isFetching,
  };
}
