'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserSession {
  name: string;
  email: string;
  role: string;
  memberSince: string;
  movementsCount: number;
  avatarColor: string;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: UserSession;
  updateUser: (data: Partial<UserSession>) => void;
  logout: () => Promise<void>;
}

const mockUser: UserSession = {
  name: 'Juan Roberto Restrepo',
  email: 'juan.restrepo@sgia.com',
  role: 'Administrador',
  memberSince: 'Enero 2026',
  movementsCount: 47,
  avatarColor: '#FEE9E3', // Orange soft
  status: 'active'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession>(mockUser);

  const updateUser = (data: Partial<UserSession>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const logout = async () => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
