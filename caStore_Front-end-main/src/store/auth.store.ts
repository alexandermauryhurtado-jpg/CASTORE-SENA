import { create } from 'zustand';
import { 
  AuthUser, 
  AuthState, 
  LoginCredentials 
} from '../features/auth/types/auth.types';
import {
  getStoredToken,
  getStoredUser,
  storeToken,
  storeUser,
  parseJwt,
} from '../lib/auth';
import { authService } from '../services/auth.service';

interface AuthActions {
  loginAction: (credentials: LoginCredentials) => Promise<void>;
  logoutAction: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Estado inicial hidratado desde localStorage
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  isAuthenticated: !!getStoredToken(),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  loginAction: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      const { token, user: basicUser } = response;
      
      // Decodificar permisos del token
      const payload = parseJwt(token);
      if (!payload) throw new Error('Token inválido');

      const fullUser: AuthUser = {
        ...basicUser,
        permissions: payload.permissions
      };

      // Persistir
      storeToken(token);
      storeUser(fullUser);

      set({
        user: fullUser,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logoutAction: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  refreshUser: async () => {
    try {
      const user = await authService.getMe();
      storeUser(user);
      set({ user });
    } catch {
      // Error al actualizar usuario
    }
  }
}));
