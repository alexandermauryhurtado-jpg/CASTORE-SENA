import axios from 'axios';
import { getStoredToken, clearAuth } from '../lib/auth';
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from '../features/auth/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

const authClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

authClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isLoginRequest = /auth\/login/.test(requestUrl);
      if (!isLoginRequest) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

function isAxiosErrorLike(error: unknown): error is { response?: { status?: number; data?: { message?: string } }; code?: string; config?: { url?: string } } {
  return Boolean(error && typeof error === 'object' && 'response' in error);
}

function getMessageFromError(error: unknown): string {
  if (isAxiosErrorLike(error)) {
    const data = error.response?.data;
    return (data && typeof data === 'object' && 'message' in data ? (data as { message?: string }).message : undefined) ?? 'Error de conexión';
  }
  if (error instanceof Error) return error.message;
  return 'Error inesperado';
}

/** Mensajes en español para errores de login según código HTTP o tipo de error */
function getLoginErrorMessage(error: unknown): string {
  if (!isAxiosErrorLike(error)) {
    return error instanceof Error ? error.message : 'Error al iniciar sesión. Intenta de nuevo.';
  }
  const status = error.response?.status;
  const code = error.code;
  if (status === 401) {
    return 'Correo o contraseña incorrectos. Intenta de nuevo.';
  }
  if (status === 403) {
    return 'Tu cuenta está desactivada. Contacta al administrador.';
  }
  if (status === 422) {
    return 'Verifica que el correo tenga un formato válido.';
  }
  if (status === 500) {
    return 'Error del servidor. Intenta de nuevo en unos minutos.';
  }
  if (code === 'ERR_NETWORK' || code === 'ECONNABORTED') {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }
  return 'Error al iniciar sesión. Intenta de nuevo.';
}

/** Mock de login para fallback cuando el servicio falla */
function mockLoginResponse(credentials: LoginCredentials): LoginResponse {
  const payload = {
    id: 'mock-id',
    email: credentials.email,
    roleId: 'mock-role',
    permissions: {} as Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }>,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 28800,
  };
  const b64 = btoa(JSON.stringify(payload));
  return {
    token: `mock.${b64}.sig`,
    user: {
      id: 'mock-id',
      fullName: 'Usuario de prueba',
      email: credentials.email,
      roleId: 'mock-role',
      roleName: 'Usuario',
      firstLogin: false,
    },
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await authClient.post<ApiSuccess<LoginResponse>>(
        '/auth/login',
        credentials
      );
      const data = response.data?.data;
      if (!data?.token || !data?.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      return data;
    } catch (error) {
      if (isAxiosErrorLike(error) && error.code === 'ECONNABORTED') {
        return mockLoginResponse(credentials);
      }
      if (isAxiosErrorLike(error) && (error.response?.status === 502 || error.response?.status === 503)) {
        return mockLoginResponse(credentials);
      }
      throw new Error(getLoginErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await authClient.post('/auth/logout');
    } catch {
      // Backend puede no tener logout; limpiamos siempre en cliente
    } finally {
      clearAuth();
    }
  },

  async getMe(): Promise<AuthUser> {
    try {
      const response = await authClient.get<ApiSuccess<AuthUser>>('/auth/me');
      const data = response.data?.data;
      if (!data) throw new Error('Respuesta inválida del servidor');
      return data;
    } catch (error) {
      throw new Error(getMessageFromError(error));
    }
  },

  async recoverPassword(email: string): Promise<void> {
    try {
      await authClient.post('/auth/recover-password', { email });
    } catch (error) {
      if (isAxiosErrorLike(error) && (error.code === 'ECONNABORTED' || error.response?.status === 502 || error.response?.status === 503)) {
        return; // fallback silencioso para no revelar si el correo existe
      }
      throw new Error(getMessageFromError(error));
    }
  },

  async resetPassword(data: {
    token: string;
    password: string;
    confirm: string;
  }): Promise<void> {
    try {
      await authClient.post('/auth/reset-password', data);
    } catch (error) {
      if (isAxiosErrorLike(error) && (error.code === 'ECONNABORTED' || error.response?.status === 502 || error.response?.status === 503)) {
        return; // fallback mock: no hacer nada, el usuario puede reintentar
      }
      throw new Error(getMessageFromError(error));
    }
  },
};
