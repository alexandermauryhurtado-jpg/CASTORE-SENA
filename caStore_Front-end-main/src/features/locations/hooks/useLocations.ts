'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { locationsService } from '@/src/services/locations.service';
import type {
  Location,
  LocationTreeNode,
  LocationWithDetailsApi,
  LocationTreeApi,
  GetLocationsParams,
  CreateLocationDto,
  UpdateLocationDto,
} from '../types/locations.types';
import { mockLocations, mockLocationsTree } from '../mockData';

const LOCATIONS_QUERY_KEY = ['locations'] as const;
const LOCATIONS_TREE_QUERY_KEY = ['locations', 'tree'] as const;

function locationsListKey(params: GetLocationsParams) {
  return [...LOCATIONS_QUERY_KEY, 'list', params] as const;
}

function locationDetailKey(id: string | null) {
  return ['locations', 'detail', id ?? ''] as const;
}

function apiToLocation(row: LocationWithDetailsApi): Location {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    capacity: row.capacity ?? undefined,
    parentId: row.parentId ?? undefined,
    productCount: row.productCount,
    occupancyPercent: Number(Number(row.occupancy).toFixed(2)),
    childCount: row.childCount,
    parentName: row.parentName ?? undefined,
    parentCode: row.parentCode ?? undefined,
  };
}

function treeApiToNode(node: LocationTreeApi): LocationTreeNode {
  return {
    id: node.id,
    code: node.code,
    name: node.name,
    type: node.type,
    capacity: node.capacity ?? undefined,
    parentId: node.parentId ?? undefined,
    productCount: node.productCount,
    occupancyPercent: Number(Number(node.occupancy).toFixed(2)),
    children: (node.children ?? []).map(treeApiToNode),
  };
}

/** Listado paginado de ubicaciones. Fallback a mock si la API devuelve null. */
export function useLocationsList(
  params: GetLocationsParams = {},
  options?: Pick<UseQueryOptions<{ data: Location[]; pagination: PaginatedLocationsState; isUsingMock: boolean }, Error>, 'enabled'>
) {
  const query = useQuery({
    queryKey: locationsListKey(params),
    queryFn: async () => {
      const result = await locationsService.getLocations(params);
      if (result && result.data.length >= 0) {
        return {
          data: result.data.map(apiToLocation),
          pagination: result.pagination,
          isUsingMock: false,
        };
      }
      const total = mockLocations.length;
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      let filtered = [...mockLocations];
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (l) => l.code.toLowerCase().includes(s) || l.name.toLowerCase().includes(s)
        );
      }
      if (params.type) {
        filtered = filtered.filter((l) => l.type === params.type);
      }
      const pagination = {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        hasNextPage: page < Math.ceil(filtered.length / limit),
        hasPrevPage: page > 1,
        nextPage: page < Math.ceil(filtered.length / limit) ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        from: filtered.length === 0 ? 0 : start + 1,
        to: Math.min(start + limit, filtered.length),
      };
      const data = filtered.slice(start, start + limit);
      return { data, pagination, isUsingMock: true };
    },
    enabled: options?.enabled ?? true,
  });

  const state = query.data;
  return {
    data: state?.data ?? [],
    pagination: state?.pagination ?? null,
    isUsingMock: state?.isUsingMock ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Árbol de ubicaciones para mapa y selectores. Fallback a mock si la API falla. */
export function useLocationsTree(
  options?: Pick<UseQueryOptions<{ tree: LocationTreeNode[]; isUsingMock: boolean }, Error>, 'enabled'>
) {
  const query = useQuery({
    queryKey: LOCATIONS_TREE_QUERY_KEY,
    queryFn: async () => {
      const result = await locationsService.getTree();
      if (result && Array.isArray(result)) {
        return { tree: result.map(treeApiToNode), isUsingMock: false };
      }
      return { tree: mockLocationsTree, isUsingMock: true };
    },
    enabled: options?.enabled ?? true,
  });

  const payload = query.data ?? { tree: mockLocationsTree, isUsingMock: true };
  return {
    tree: payload.tree,
    isUsingMock: payload.isUsingMock,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Detalle de una ubicación por ID. */
export function useLocationById(
  id: string | null,
  options?: Pick<UseQueryOptions<Location | null, Error>, 'enabled'>
) {
  const query = useQuery({
    queryKey: locationDetailKey(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await locationsService.getById(id);
      return result ? apiToLocation(result) : null;
    },
    enabled: (options?.enabled ?? true) && !!id,
  });

  return {
    location: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Crear ubicación. Invalida listado y árbol. */
export function useCreateLocation(
  options?: UseMutationOptions<Location | null, Error, CreateLocationDto, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateLocationDto) => {
      const res = await locationsService.create(dto);
      return res ? apiToLocation(res) : null;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(data, variables, context, undefined as unknown);
    },
    ...options,
  });
}

/** Actualizar ubicación. Invalida listado, árbol y detalle. */
export function useUpdateLocation(
  options?: UseMutationOptions<
    Location | null,
    Error,
    { id: string; dto: UpdateLocationDto },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateLocationDto }) => {
      const res = await locationsService.update(id, dto);
      return res ? apiToLocation(res) : null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: locationDetailKey(variables.id) });
      }
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(data, variables, undefined, undefined as unknown);
    },
    ...options,
  });
}

/** Soft delete (desactivar). Falla si tiene productos o hijos. Invalida listado y árbol. */
export function useDeleteLocation(
  options?: UseMutationOptions<void, Error, string, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationsService.delete(id),
    onSuccess: (_data, _id) => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LOCATIONS_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: locationDetailKey(_id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, _id, undefined, undefined as unknown);
    },
    ...options,
  });
}

/** Verificación de código disponible (debounce 500ms se hace en el componente). */
export function useCheckLocationCode(code: string, excludeId?: string) {
  return useQuery({
    queryKey: ['locations', 'checkCode', code, excludeId],
    queryFn: async () => locationsService.checkCodeAvailable(code, excludeId),
    enabled: code.length >= 2,
  });
}

/** Compatibilidad: mismo contrato que antes para la página (listado plano + refresh + isEmpty + isUsingMock). */
export function useLocations() {
  const { data, pagination, isLoading, error, refetch, isUsingMock } = useLocationsList({
    page: 1,
    limit: 1000,
  });

  return {
    locations: data,
    isLoading,
    isUsingMock,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refresh: refetch,
    isEmpty: !pagination ? true : pagination.total === 0,
  };
}

/** Tipo de paginación devuelto por el hook (sin totalPages etc. opcionales). */
interface PaginatedLocationsState {
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
