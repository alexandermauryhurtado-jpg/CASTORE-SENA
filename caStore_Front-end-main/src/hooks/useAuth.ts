import { useAuthStore } from '../store/auth.store';
import { hasPermission } from '../lib/auth';

export function useAuth() {
  const { 
    user, 
    token, 
    isLoading, 
    isAuthenticated, 
    loginAction, 
    logoutAction, 
    refreshUser 
  } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    loginAction,
    logoutAction,
    refreshUser,
    isAdmin: user?.roleName === 'Administrador',
    can: (module: string, action: 'read' | 'create' | 'update' | 'delete') => 
      hasPermission(user, module, action),
    canRead: (module: string) => hasPermission(user, module, 'read'),
    canCreate: (module: string) => hasPermission(user, module, 'create'),
    canUpdate: (module: string) => hasPermission(user, module, 'update'),
    canDelete: (module: string) => hasPermission(user, module, 'delete'),
  };
}
