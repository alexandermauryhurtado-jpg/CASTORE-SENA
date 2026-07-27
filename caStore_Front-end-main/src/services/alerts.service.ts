import api from '../lib/api';
import type { Alert, AlertSummaryApi, PaginatedAlertsResponse } from '../features/alerts/types/alerts.types';

const BASE = '/alerts';

export interface GetAlertsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const alertsService = {
  async getAlerts(params: GetAlertsParams = {}): Promise<PaginatedAlertsResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.type) searchParams.set('type', params.type);
    if (params.status) searchParams.set('status', params.status);
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.set('dateTo', params.dateTo);

    const response = await api.get<PaginatedAlertsResponse>(`${BASE}?${searchParams.toString()}`);
    if (!response?.data || !response.data.data) return null;
    return response.data;
  },

  async getSummary(): Promise<AlertSummaryApi | null> {
    const response = await api.get<AlertSummaryApi>(`${BASE}/summary`);
    if (!response?.data) return null;
    return response.data;
  },

  async getById(id: string): Promise<Alert | null> {
    const response = await api.get<Alert>(`${BASE}/${id}`);
    if (!response?.data) return null;
    return response.data;
  },

  async resolve(id: string, notes?: string): Promise<Alert | null> {
    const response = await api.patch<{ success: boolean; message: string; data: Alert }>(
      `${BASE}/${id}/resolve`,
      notes != null && notes.trim() !== '' ? { notes: notes.trim() } : {}
    );
    if (!response?.data?.data) return null;
    return response.data.data;
  },

  async dismiss(id: string, notes?: string): Promise<Alert | null> {
    const response = await api.patch<{ success: boolean; message: string; data: Alert }>(
      `${BASE}/${id}/dismiss`,
      notes != null && notes.trim() !== '' ? { notes: notes.trim() } : {}
    );
    if (!response?.data?.data) return null;
    return response.data.data;
  },
};
