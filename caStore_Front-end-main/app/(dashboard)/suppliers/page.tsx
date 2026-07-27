'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Plus } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { Button } from '@/src/components/ui/Button';
import { useSuppliersList } from '@/src/features/suppliers/hooks/useSuppliers';
import { SuppliersList } from '@/src/features/suppliers/components/SuppliersList/SuppliersList';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';

export default function SuppliersPage() {
  const { data, pagination, isLoading, error, refetch } = useSuppliersList({
    page: 1,
    limit: 10,
  });
  const isEmpty = !isLoading && (pagination?.total ?? 0) === 0;

  if (error) {
    return (
      <ProtectedPage module="suppliers">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar los proveedores</h3>
            <p>{error.message}</p>
            <button type="button" onClick={() => refetch()} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="suppliers">
      <div className={styles.container}>
        <PageWrapper
          title="Gestión de Proveedores"
          subtitle="Administra tus proveedores y relaciones comerciales"
          actions={
            <>
              <button
                type="button"
                className={clsx(styles.refreshBtn, isLoading && styles.spinning)}
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw size={18} />
                <span>Actualizar</span>
              </button>
              <Link href="/suppliers/new" passHref legacyBehavior>
                <Button variant="primary">
                  <Plus size={16} />
                  Crear proveedor
                </Button>
              </Link>
            </>
          }
        >
          {isLoading && data.length === 0 ? (
            <SkeletonTable rows={6} columns={5} />
          ) : isEmpty ? (
            <EmptyState
              title="No hay proveedores"
              message="No se encontraron proveedores registrados."
              icon={<PackageSearch size={48} />}
              action={{ label: 'Reintentar', onClick: () => refetch() }}
            />
          ) : (
            <SuppliersList />
          )}
        </PageWrapper>
      </div>
    </ProtectedPage>
  );
}
