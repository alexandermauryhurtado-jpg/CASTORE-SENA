import React from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.layoutWrapper}>
      {/* Panel Izquierdo - Branding (oculto en mobile) */}
      <div className={styles.leftPanel}>
        {/* Logo/Icono simplificado (un cuadrado para simbolizar inventario) */}
        <div className={styles.logoWrapper}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
          </svg>
        </div>
        <h1 className={styles.brandTitle}>
          CA STORE
        </h1>
        <p className={styles.brandSubtitle}>
          Sistema de Gestión de Inventario Automotriz
        </p>
      </div>

      {/* Panel Derecho - Contenido (Auth Forms) */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}
