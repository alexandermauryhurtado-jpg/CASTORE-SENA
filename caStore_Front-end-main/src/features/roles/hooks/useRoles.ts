'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { rolesService } from '@/src/services/roles.service';
import { apiRoleToView } from '../types/roles.types';
import type {
  RoleView,
  GetRolesParams,
  CreateRoleDto,
  UpdateRoleDto,
  ApiRole,
  RolesListResponse,
} from '../types/roles.types';
import { getMockRolesList, getMockRoleById } from '../mock/roles.mock';

const ROLES_QUERY_KEY = ['roles'] as const;

function rolesListKey(params: GetRolesParams) {
  return [...ROLES_QUERY_KEY, 'list', params] as const;
}

function roleDetailKey(id: string) {
  return [...ROLES_QUERY_KEY, 'detail', id] as const;
}

type RolesListResult = RolesListResponse & { _isMock?: boolean };

/** Listado paginado de roles. Fallback a mock si la API falla o devuelve null. */
export function useRolesList(params: GetRolesParams = {}, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: rolesListKey(params),
    queryFn: async (): Promise<RolesListResult> => {
      const result = await rolesService.getRoles(params);
      if (result && Array.isArray(result.data)) return { ...result, _isMock: false };
      const mock = getMockRolesList(params);
      return { ...mock, _isMock: true };
    },
    enabled: options?.enabled ?? true,
  });

  const data = query.data;
  const roles: RoleView[] = data?.data?.map(apiRoleToView) ?? [];
  const pagination = data?.pagination ?? null;

  return {
    roles,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isUsingMock: data?._isMock === true,
  };
}

/** Simplificado: listado sin paginación para grid (página 1, limit 100). */
export function useRoles(options?: UseQueryOptions<{ roles: RoleView[]; isUsingMock: boolean }, Error>) {
  const { roles, pagination, isLoading, error, refetch, isUsingMock } = useRolesList(
    { page: 1, limit: 100 },
    {
      enabled: typeof options?.enabled === 'boolean' ? options.enabled : true,
    }
  );
  const isEmpty = (pagination?.total ?? 0) === 0 && !isLoading;
  return {
    roles,
    isLoading,
    isUsingMock,
    error: error ? (error as Error).message : null,
    refresh: refetch,
    isEmpty,
  };
}

/** Detalle de un rol por ID. Fallback a mock si no existe en API. */
export function useRole(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: roleDetailKey(id ?? ''),
    queryFn: async (): Promise<ApiRole | null> => {
      if (!id) return null;
      const result = await rolesService.getRoleById(id);
      if (result) return result;
      return getMockRoleById(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  const roleView: RoleView | null = query.data ? apiRoleToView(query.data) : null;
  return {
    role: roleView,
    roleApi: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Crear rol. Invalida listado. */
export function useCreateRole(
  opts?: UseMutationOptions<ApiRole | null, Error, CreateRoleDto, unknown>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoleDto) => rolesService.createRole(dto),
    onSuccess: (_data, _variables, _context, mutationOpts) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      opts?.onSuccess?.(_data, _variables, _context, mutationOpts);
    },
    ...opts,
  });
}

/** Actualizar rol. Invalida listado y detalle del id. */
export function useUpdateRole(
  opts?: UseMutationOptions<ApiRole | null, Error, { id: string; dto: UpdateRoleDto }, unknown>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      rolesService.updateRole(id, dto),
    onSuccess: (_data, variables, _context, mutationOpts) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: roleDetailKey(variables.id) });
      }
      opts?.onSuccess?.(_data, variables, _context, mutationOpts);
    },
    ...opts,
  });
}

/** Eliminar (soft) rol. Invalida listado y detalle. */
export function useDeleteRole(opts?: UseMutationOptions<void, Error, string, unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: (_data, id, _context, mutationOpts) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      if (id) queryClient.invalidateQueries({ queryKey: roleDetailKey(id) });
      opts?.onSuccess?.(_data, id, _context, mutationOpts);
    },
    ...opts,
  });
}

/** Clonar rol. Invalida listado. */
export function useCloneRole(
  opts?: UseMutationOptions<ApiRole | null, Error, { id: string; name: string }, unknown>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => rolesService.cloneRole(id, name),
    onSuccess: (_data, _variables, _context, mutationOpts) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      opts?.onSuccess?.(_data, _variables, _context, mutationOpts);
    },
    ...opts,
  });
}
