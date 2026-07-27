'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Toast.module.css';

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToast({ ...options, id });

    setTimeout(() => {
      setToast((current) => {
        if (current?.id === id) {
          return null;
        }
        return current;
      });
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={styles.toastContainer}>
          <div className={clsx(styles.toast, styles[toast.type || 'info'])}>
            {toast.type === 'success' && <CheckCircle2 className={styles.icon} size={20} />}
            {toast.type === 'error' && <AlertCircle className={styles.icon} size={20} />}
            <p className={styles.message}>{toast.message}</p>
            <button className={styles.closeBtn} onClick={() => setToast(null)} aria-label="Cerrar notificación">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
