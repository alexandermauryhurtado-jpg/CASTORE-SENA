/** Respuesta del backend (GET /users, GET /users/:id) */
export interface UserApi {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  permissions?: Record<string, Record<string, boolean>>;
  roleIsSystem?: boolean;
}

/** Usuario normalizado para la UI (listado, tabla, formulario) */
export interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  createdAt: string;
  avatarColor?: string;
}

/** Parámetros de listado paginado (GET /users) */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  status?: 'all' | 'active' | 'inactive';
}

/** Respuesta paginada del backend */
export interface UsersPaginatedResponse {
  data: UserApi[];
  pagination: {
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
  };
}

/** Crear usuario (POST /users) */
export interface CreateUserDto {
  fullName: string;
  email: string;
  roleId: string;
}

/** Actualizar usuario (PATCH /users/:id) */
export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  roleId?: string;
}

/** Actualizar estado (PATCH /users/:id/status) */
export interface UpdateUserStatusDto {
  isActive: boolean;
}

/** Convierte UserApi a User para la UI */
export function mapUserApiToUser(api: UserApi): User {
  return {
    id: api.id,
    name: api.fullName,
    fullName: api.fullName,
    email: api.email,
    roleId: api.roleId,
    roleName: api.roleName,
    status: api.isActive ? 'active' : 'inactive',
    lastAccess: api.lastLoginAt ?? 'never',
    createdAt: api.createdAt,
  };
}
