'use client';

import React, { ReactNode } from 'react';
import { QueryProvider } from '../components/QueryProvider';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
