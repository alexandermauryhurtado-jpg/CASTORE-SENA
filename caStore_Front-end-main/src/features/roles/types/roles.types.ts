/**
 * Tipos del módulo de roles alineados con el backend.
 * API usa read/create/update/delete; la UI de formularios usa consult (mapeado desde read).
 */

export interface PermissionItem {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

/** Rol tal como lo devuelve el backend */
export interface ApiRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Record<string, PermissionItem>;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Rol con conteo de usuarios (listado) */
export interface ApiRoleWithUserCount extends ApiRole {
  userCount: number;
}

export interface RolesPagination {
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

export interface RolesListResponse {
  success: boolean;
  message?: string;
  data: ApiRoleWithUserCount[];
  pagination: RolesPagination;
}

export interface RoleSingleResponse {
  success: boolean;
  message?: string;
  data: ApiRole;
}

/** Parámetros para GET /roles */
export interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'all' | 'system' | 'custom';
  includeInactive?: boolean;
}

/** DTO para crear rol (backend: read/create/update/delete) */
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Record<string, PermissionItem>;
}

/** DTO para actualizar rol (parcial) */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Record<string, PermissionItem>;
}

/** Conjunto de permisos en la UI (formulario usa "consult" en lugar de "read") */
export interface PermissionSetUI {
  consult: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

/** Rol para la UI (grid, detalle, formulario) compatible con RoleCard/RoleDetail/RoleForm */
export interface RoleView {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  userCount: number;
  permissions: Record<string, PermissionSetUI>;
  createdAt: string;
  lastModified?: string;
  modifiedBy?: string;
}

/** Convierte permisos API (read) a UI (consult) */
function permissionApiToUi(perms: PermissionItem): PermissionSetUI {
  return {
    consult: perms.read,
    create: perms.create,
    update: perms.update,
    delete: perms.delete,
  };
}

/** Convierte permisos UI (consult) a API (read) */
export function permissionUiToApi(perms: PermissionSetUI): PermissionItem {
  return {
    read: perms.consult,
    create: perms.create,
    update: perms.update,
    delete: perms.delete,
  };
}

/** Convierte rol API a vista para grid/detalle/formulario */
export function apiRoleToView(api: ApiRoleWithUserCount | ApiRole): RoleView {
  const perms = api.permissions ?? {};
  const permissionsUI: Record<string, PermissionSetUI> = {};
  for (const [moduleId, p] of Object.entries(perms)) {
    permissionsUI[moduleId] = permissionApiToUi(p as PermissionItem);
  }
  return {
    id: api.id,
    name: api.name,
    description: api.description ?? '',
    type: api.isSystem ? 'system' : 'custom',
    userCount: 'userCount' in api ? api.userCount : 0,
    permissions: permissionsUI,
    createdAt:
      typeof api.createdAt === 'string'
        ? api.createdAt
        : (api.createdAt as Date)?.toISOString?.() ?? '',
    lastModified:
      typeof api.updatedAt === 'string'
        ? api.updatedAt
        : (api.updatedAt as Date)?.toISOString?.() ?? undefined,
  };
}

/** Convierte datos del formulario a DTO de creación/actualización */
export function formDataToCreateDto(perms: Record<string, PermissionSetUI>, name: string, description?: string): CreateRoleDto {
  const permissions: Record<string, PermissionItem> = {};
  for (const [k, v] of Object.entries(perms)) {
    permissions[k] = permissionUiToApi(v);
  }
  return { name, description: description ?? undefined, permissions };
}
