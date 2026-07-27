import axios from 'axios';
import api from '@/src/lib/api';
import type {
  UserApi,
  GetUsersParams,
  UsersPaginatedResponse,
  CreateUserDto,
  UpdateUserDto,
} from '@/src/features/users/types/users.types';
import type { AuthUser } from '@/src/features/auth/types/auth.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: UsersPaginatedResponse['pagination'];
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirm: string;
}

function getMessageFromError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    return data?.message ?? 'Error de conexión';
  }
  if (error instanceof Error) return error.message;
  return 'Error inesperado';
}

export const usersService = {
  /**
   * GET /users — Listado paginado con filtros (rol, estado, búsqueda).
   */
  async getUsers(params: GetUsersParams = {}): Promise<UsersPaginatedResponse | null> {
    const searchParams = new URLSearchParams();
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.roleId) searchParams.set('roleId', params.roleId);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);

    const response = await api.get<ApiSuccessResponse<UserApi[]>>(
      `/users?${searchParams.toString()}`
    );
    const body = response.data as ApiSuccessResponse<UserApi[]>;
    if (!body?.success || !Array.isArray(body.data)) return null;
    return {
      data: body.data,
      pagination: body.pagination ?? {
        total: body.data.length,
        page,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        from: body.data.length ? 1 : 0,
        to: body.data.length,
      },
    };
  },

  /**
   * GET /users/:id — Detalle de un usuario.
   */
  async getUserById(id: string): Promise<UserApi | null> {
    const response = await api.get<ApiSuccessResponse<UserApi>>(`/users/${id}`);
    const body = response.data as ApiSuccessResponse<UserApi>;
    if (!body?.success || !body.data) return null;
    return body.data;
  },

  /**
   * POST /users — Crear usuario.
   */
  async createUser(dto: CreateUserDto): Promise<UserApi | null> {
    const response = await api.post<ApiSuccessResponse<UserApi>>('/users', dto);
    const body = response.data as ApiSuccessResponse<UserApi>;
    if (!body?.success || !body.data) return null;
    return body.data;
  },

  /**
   * PATCH /users/:id — Actualizar usuario.
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserApi | null> {
    const response = await api.patch<ApiSuccessResponse<UserApi>>(`/users/${id}`, dto);
    const body = response.data as ApiSuccessResponse<UserApi>;
    if (!body?.success || !body.data) return null;
    return body.data;
  },

  /**
   * PATCH /users/:id/status — Activar/desactivar usuario. Body: { isActive: boolean }.
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<UserApi | null> {
    const response = await api.patch<ApiSuccessResponse<UserApi>>(`/users/${id}/status`, {
      isActive,
    });
    const body = response.data as ApiSuccessResponse<UserApi>;
    if (!body?.success || !body.data) return null;
    return body.data;
  },

  /**
   * POST /users/:id/resend-password — Reenviar contraseña temporal.
   */
  async resendPassword(id: string): Promise<{ success: boolean; message?: string } | null> {
    const response = await api.post<ApiSuccessResponse<unknown>>(`/users/${id}/resend-password`);
    const body = response.data as ApiSuccessResponse<unknown>;
    if (!body?.success) return null;
    return { success: true, message: body.message };
  },

  /**
   * Comprueba si un email ya existe (para validación en formulario).
   * Usa GET /users con search; si la API falla devuelve null (no bloqueamos).
   * excludeUserId: en edición, excluir el usuario actual.
   */
  async checkEmailExists(
    email: string,
    excludeUserId?: string
  ): Promise<boolean> {
    if (!email?.trim()) return false;
    const result = await this.getUsers({ search: email.trim(), limit: 20, page: 1 });
    if (!result?.data) return false;
    const normalized = email.trim().toLowerCase();
    const exists = result.data.some(
      (u) => u.email.toLowerCase() === normalized && u.id !== excludeUserId
    );
    return exists;
  },

  /**
   * PATCH /users/me/profile — Actualizar nombre y/o email del usuario actual.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    try {
      const response = await api.patch<ApiSuccessResponse<AuthUser>>('/users/me/profile', payload);
      const body = response.data as ApiSuccessResponse<AuthUser>;
      if (!body?.success || !body.data) throw new Error(body?.message ?? 'Respuesta inválida del servidor');
      return body.data;
    } catch (error) {
      throw new Error(getMessageFromError(error));
    }
  },

  /**
   * PATCH /users/me/password — Cambiar contraseña del usuario actual.
   */
  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    try {
      const response = await api.patch<ApiSuccessResponse<null>>('/users/me/password', payload);
      const body = response.data as ApiSuccessResponse<null>;
      if (!body?.success) throw new Error(body?.message ?? 'Respuesta inválida del servidor');
    } catch (error) {
      throw new Error(getMessageFromError(error));
    }
  },
};

export { getMessageFromError as getUsersServiceErrorMessage };
