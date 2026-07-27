import api from '../lib/api';
import type {
  DashboardData,
  DashboardKPIs,
  DashboardCharts,
  DashboardWidgets,
} from '../features/dashboard/types/dashboard.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData | null> {
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data?.data ?? null;
  },

  async getKPIs(): Promise<DashboardKPIs | null> {
    const response = await api.get<ApiResponse<DashboardKPIs>>('/dashboard/kpis');
    return response.data?.data ?? null;
  },

  async getCharts(): Promise<DashboardCharts | null> {
    const response = await api.get<ApiResponse<DashboardCharts>>('/dashboard/charts');
    return response.data?.data ?? null;
  },

  async getWidgets(): Promise<DashboardWidgets | null> {
    const response = await api.get<ApiResponse<DashboardWidgets>>('/dashboard/widgets');
    return response.data?.data ?? null;
  },
};
