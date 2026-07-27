import axios from 'axios';
import api from '@/src/lib/api';
import type {
  ApiRole,
  ApiRoleWithUserCount,
  RolesListResponse,
  RoleSingleResponse,
  GetRolesParams,
  CreateRoleDto,
  UpdateRoleDto,
} from '@/src/features/roles/types/roles.types';

const BASE = '/roles';

function unwrap<T>(res: { data?: { success?: boolean; data?: T } }): T | null {
  const d = res?.data;
  if (!d || d.success === false) return null;
  return (d as { data?: T }).data ?? null;
}

/** GET /roles - listado paginado */
export async function getRoles(params: GetRolesParams = {}): Promise<RolesListResponse | null> {
  try {
    const response = await api.get<RolesListResponse>(BASE, { params });
    const raw = response.data;
    if (!raw || (raw as { success?: boolean }).success === false) return null;
    return raw as RolesListResponse;
  } catch {
    return null;
  }
}

/** GET /roles/:id - rol por ID */
export async function getRoleById(id: string): Promise<ApiRole | null> {
  try {
    const response = await api.get<RoleSingleResponse>(`${BASE}/${id}`);
    return unwrap(response) ?? null;
  } catch {
    return null;
  }
}

/** POST /roles - crear rol */
export async function createRole(dto: CreateRoleDto): Promise<ApiRole | null> {
  const response = await api.post<RoleSingleResponse>(BASE, dto);
  return unwrap(response) ?? null;
}

/** PATCH /roles/:id - actualizar rol */
export async function updateRole(id: string, dto: UpdateRoleDto): Promise<ApiRole | null> {
  const response = await api.patch<RoleSingleResponse>(`${BASE}/${id}`, dto);
  return unwrap(response) ?? null;
}

/** DELETE /roles/:id - soft delete (desactivar) */
export async function deleteRole(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

/** POST /roles/:id/clone - clonar rol */
export async function cloneRole(id: string, name: string): Promise<ApiRole | null> {
  const response = await api.post<RoleSingleResponse>(`${BASE}/${id}/clone`, { name });
  return unwrap(response) ?? null;
}

/** Extrae mensaje de error para mostrar en toast (backend o genérico). */
export function getRoleErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: unknown } }).response?.data != null && typeof (err as { response: { data: unknown } }).response.data === 'object') {
    const msg = ((err as { response: { data: { message?: string } } }).response.data as { message?: string }).message;
    if (typeof msg === 'string') return msg;
  }
  return err instanceof Error ? err.message : 'Error en la operación';
}

export const rolesService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  cloneRole,
  getRoleErrorMessage,
};
