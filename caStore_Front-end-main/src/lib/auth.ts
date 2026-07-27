import { AuthTokenPayload, AuthUser } from '../features/auth/types/auth.types';

export const TOKEN_KEY = 'sgia_token';
export const USER_KEY = 'sgia_user';

export function parseJwt(token: string): AuthTokenPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // También guardamos en cookie para el middleware (8 horas)
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=28800; SameSite=Lax`;
  }
}

export function storeUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function hasPermission(
  user: AuthUser | null,
  module: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  return user?.permissions?.[module]?.[action] ?? false;
}

export function canAccessModule(
  user: AuthUser | null,
  module: string
): boolean {
  return hasPermission(user, module, 'read');
}
