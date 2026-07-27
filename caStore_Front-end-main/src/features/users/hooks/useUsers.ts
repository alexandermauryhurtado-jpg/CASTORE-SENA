'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { usersService } from '@/src/services/users.service';
import { getRoles, getRoleById } from '@/src/services/roles.service';
import type {
  User,
  GetUsersParams,
  CreateUserDto,
  UpdateUserDto,
} from '@/src/features/users/types/users.types';
import { mapUserApiToUser } from '@/src/features/users/types/users.types';
import { getMockPaginatedUsers, getMockUserById } from '@/src/features/users/getMockUsers';
import { mockRoles } from '@/src/features/users/mockData';

const USERS_QUERY_KEY = ['users'] as const;
const ROLES_FOR_SELECT_KEY = ['roles', 'forSelect'] as const;
const usersListKey = (params: GetUsersParams) => [...USERS_QUERY_KEY, 'list', params] as const;
const userDetailKey = (id: string) => [...USERS_QUERY_KEY, 'detail', id] as const;

type ListResult = {
  data: User[];
  pagination: ReturnType<typeof getMockPaginatedUsers>['pagination'];
  isMock?: boolean;
};

/** Listado paginado con filtros (rol, estado, búsqueda). Fallback a mock si la API falla. */
export function useUsersList(params: GetUsersParams = {}) {
  const query = useQuery({
    queryKey: usersListKey(params),
    queryFn: async (): Promise<ListResult> => {
      const result = await usersService.getUsers(params);
      if (result?.data && result?.pagination) {
        return {
          data: result.data.map(mapUserApiToUser),
          pagination: result.pagination,
        };
      }
      const mock = getMockPaginatedUsers(params);
      return { ...mock, isMock: true };
    },
  });

  const raw = query.data;
  const data = raw?.data ?? [];
  const pagination = raw?.pagination ?? null;
  const isUsingMock = Boolean(raw && 'isMock' in raw && raw.isMock);

  return {
    data,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isUsingMock,
  };
}

/** Detalle de un usuario por ID. Fallback a mock si la API falla. */
export function useUser(id: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: userDetailKey(id ?? ''),
    queryFn: async (): Promise<User | null> => {
      if (!id) return null;
      const result = await usersService.getUserById(id);
      if (result) return mapUserApiToUser(result);
      return getMockUserById(id);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isUsingMock: query.data !== undefined && !query.isLoading && Boolean(id) && query.data !== null,
  };
}

/** Crear usuario. Invalida listado. Toast y redirección en el componente. */
export function useCreateUser(
  options?: UseMutationOptions<User | null, Error, CreateUserDto, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateUserDto) => {
      const result = await usersService.createUser(dto);
      return result ? mapUserApiToUser(result) : null;
    },
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, _variables, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Actualizar usuario. Invalida listado y detalle. */
export function useUpdateUser(
  options?: UseMutationOptions<
    User | null,
    Error,
    { id: string; dto: UpdateUserDto },
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateUserDto }) => {
      const result = await usersService.updateUser(id, dto);
      return result ? mapUserApiToUser(result) : null;
    },
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: userDetailKey(variables.id) });
      }
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, variables, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Activar/desactivar usuario. Invalida listado y detalle. */
export function useUpdateUserStatus(
  options?: UseMutationOptions<User | null, Error, { id: string; isActive: boolean }, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await usersService.updateUserStatus(id, isActive);
      return result ? mapUserApiToUser(result) : null;
    },
    onSuccess: (_data, variables, _context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: userDetailKey(variables.id) });
      }
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, variables, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Reenviar contraseña temporal. Invalida listado y detalle (por si el backend devuelve algo). */
export function useResendPassword(
  options?: UseMutationOptions<
    { success: boolean; message?: string } | null,
    Error,
    string,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.resendPassword(id),
    onSuccess: (_data, id, _context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: userDetailKey(id) });
      (options?.onSuccess as ((a: unknown, b: unknown, c: unknown, d: unknown) => void) | undefined)?.(_data, id, _context, undefined as unknown);
    },
    ...options,
  });
}

/** Listado de roles para selectores (GET /roles). Fallback a mock. */
export function useRolesForSelect() {
  const query = useQuery({
    queryKey: ROLES_FOR_SELECT_KEY,
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const res = await getRoles({ page: 1, limit: 100 });
      if (res?.data?.length) {
        return res.data.map((r) => ({ id: r.id, name: r.name }));
      }
      return mockRoles.map((r) => ({ id: r.id, name: r.name }));
    },
  });
  const roles = query.data ?? [];
  const isUsingMock = roles.length > 0 && query.data !== undefined && !query.isLoading;
  return { roles, isLoading: query.isLoading, isUsingMock, refetch: query.refetch };
}

/** Permisos de un rol para mostrar en panel (consult = read del API) */
export interface RolePermissionsView {
  id: string;
  name: string;
  permissions: Record<string, { consult: boolean; create: boolean; update: boolean; delete: boolean }>;
  type?: 'system' | 'custom';
}

/** Rol por ID para panel de permisos (GET /roles/:id). Fallback a mock. */
export function useRoleForPermissions(roleId: string | null) {
  const query = useQuery({
    queryKey: ['roles', 'detail', roleId ?? ''],
    queryFn: async (): Promise<RolePermissionsView | null> => {
      if (!roleId) return null;
      const api = await getRoleById(roleId);
      if (api?.permissions) {
        const permissions: RolePermissionsView['permissions'] = {};
        for (const [mod, p] of Object.entries(api.permissions)) {
          const item = p as { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
          permissions[mod] = {
            consult: Boolean(item.read),
            create: Boolean(item.create),
            update: Boolean(item.update),
            delete: Boolean(item.delete),
          };
        }
        return { id: api.id, name: api.name, permissions, type: api.isSystem ? 'system' : 'custom' };
      }
      const mock = mockRoles.find((r) => r.id === roleId);
      if (!mock) return null;
      return {
        id: mock.id,
        name: mock.name,
        permissions: mock.permissions as RolePermissionsView['permissions'],
        type: mock.type,
      };
    },
    enabled: Boolean(roleId),
  });
  return { role: query.data ?? null, isLoading: query.isLoading };
}
