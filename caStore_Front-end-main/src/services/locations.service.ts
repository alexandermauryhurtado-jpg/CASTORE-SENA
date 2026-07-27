import api from '../lib/api';
import type {
  LocationWithDetailsApi,
  LocationTreeApi,
  PaginatedLocationsResponse,
  ApiSuccessResponse,
  GetLocationsParams,
  CreateLocationDto,
  UpdateLocationDto,
} from '../features/locations/types/locations.types';

const BASE = '/locations';

function getData<T>(response: { data?: ApiSuccessResponse<T> }): T | null {
  if (!response?.data) return null;
  const d = response.data as ApiSuccessResponse<T>;
  return d.data ?? null;
}

function getPaginated(
  response: { data?: { data?: LocationWithDetailsApi[]; pagination?: PaginatedLocationsResponse['pagination'] } }
): PaginatedLocationsResponse | null {
  if (!response?.data) return null;
  const body = response.data as {
    data?: LocationWithDetailsApi[];
    pagination?: PaginatedLocationsResponse['pagination'];
  };
  if (!body.data || !body.pagination) return null;
  return { data: body.data, pagination: body.pagination };
}

export const locationsService = {
  /** GET /locations — listado paginado con filtros */
  async getLocations(params: GetLocationsParams = {}): Promise<PaginatedLocationsResponse | null> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.type) searchParams.set('type', params.type);
    if (params.parentId !== undefined && params.parentId !== null)
      searchParams.set('parentId', params.parentId);
    if (params.includeInactive === true) searchParams.set('includeInactive', 'true');

    const response = await api.get<{ data: LocationWithDetailsApi[]; pagination: PaginatedLocationsResponse['pagination'] }>(
      `${BASE}?${searchParams.toString()}`
    );
    return getPaginated(response);
  },

  /** GET /locations/tree — árbol para mapa y selectores */
  async getTree(): Promise<LocationTreeApi[] | null> {
    const response = await api.get<ApiSuccessResponse<LocationTreeApi[]>>(`${BASE}/tree`);
    return getData(response);
  },

  /** GET /locations/:id — detalle de una ubicación */
  async getById(id: string): Promise<LocationWithDetailsApi | null> {
    const response = await api.get<ApiSuccessResponse<LocationWithDetailsApi>>(`${BASE}/${id}`);
    return getData(response);
  },

  /** POST /locations — crear ubicación */
  async create(dto: CreateLocationDto): Promise<LocationWithDetailsApi | null> {
    const response = await api.post<ApiSuccessResponse<LocationWithDetailsApi>>(BASE, dto);
    return getData(response);
  },

  /** PATCH /locations/:id — actualizar (nombre, capacidad) */
  async update(id: string, dto: UpdateLocationDto): Promise<LocationWithDetailsApi | null> {
    const response = await api.patch<ApiSuccessResponse<LocationWithDetailsApi>>(`${BASE}/${id}`, dto);
    return getData(response);
  },

  /** DELETE /locations/:id — soft delete (desactivar). Falla si tiene productos o hijos. */
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },

  /** Verificar disponibilidad de código (para validación en formulario). No hay endpoint dedicado; usar getLocations con search o intentar crear. */
  async checkCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
    const result = await this.getLocations({ search: code, limit: 1 });
    if (!result || result.data.length === 0) return true;
    const match = result.data.find((l) => l.code.toUpperCase() === code.toUpperCase());
    if (!match) return true;
    return excludeId ? match.id === excludeId : false;
  },
};
