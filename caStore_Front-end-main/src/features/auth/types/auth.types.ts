export interface Permissions {
  [module: string]: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  firstLogin: boolean;
  permissions: Permissions;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  roleId: string;
  permissions: Permissions;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    firstLogin: boolean;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
