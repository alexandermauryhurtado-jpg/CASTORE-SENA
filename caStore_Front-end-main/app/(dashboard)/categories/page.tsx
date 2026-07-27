'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';

import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { useCategories } from '@/src/features/categories/hooks/useCategories';
import { CategoriesManagement } from '@/src/features/categories/components/CategoryManagement/CategoriesManagement';
import { AlertCircle, FolderTree } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';

export default function CategoriesPage() {
  const { categories, isLoading, error, refresh, isEmpty } = useCategories();

  if (error) {
    return (
      <ProtectedPage module="categories">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar las categorías</h3>
            <p>{error}</p>
            <button type="button" onClick={() => refresh()} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="categories">
      <div className={styles.container}>
        <PageWrapper
          title="Gestión de Categorías"
          subtitle="Organiza tu inventario por tipo de parte automotriz"
          actions={
            <button
              type="button"
              className={clsx(styles.refreshBtn, isLoading && styles.spinning)}
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw size={18} />
              <span>Actualizar</span>
            </button>
          }
        >

          {isLoading && !categories?.length ? (
            <SkeletonTable rows={6} columns={4} />
          ) : isEmpty ? (
            <EmptyState
              title="No hay categorías"
              message="No se encontraron categorías registradas."
              icon={<FolderTree size={48} />}
              action={{ label: 'Reintentar', onClick: refresh }}
            />
          ) : (
            <CategoriesManagement />
          )}
        </PageWrapper>
      </div>
    </ProtectedPage>
  );
}
