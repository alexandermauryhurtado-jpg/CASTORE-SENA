'use client';

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface ProtectedModuleProps {
  module: string;
  action: 'read' | 'create' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideIfNoAccess?: boolean;
}

export function ProtectedModule({
  module,
  action,
  children,
  fallback = null,
  hideIfNoAccess = true
}: ProtectedModuleProps) {
  const { can } = useAuth();

  if (can(module, action)) {
    return <>{children}</>;
  }

  if (hideIfNoAccess) {
    return null;
  }

  return <>{fallback}</>;
}
