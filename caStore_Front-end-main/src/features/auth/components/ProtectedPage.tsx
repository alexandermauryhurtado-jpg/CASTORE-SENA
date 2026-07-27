'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './ProtectedPage.module.css';

interface ProtectedPageProps {
  module: string;
  children: React.ReactNode;
}

export function ProtectedPage({ module, children }: ProtectedPageProps) {
  const { canRead, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!canRead(module)) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <ShieldX size={80} className={styles.icon} />
          <h1 className={styles.title}>Acceso Denegado</h1>
          <p className={styles.message}>
            No tienes los permisos necesarios para acceder a este módulo ({module}).
            Por favor, contacta al administrador si crees que esto es un error.
          </p>
          <button 
            className={styles.backBtn}
            onClick={() => router.push('/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
