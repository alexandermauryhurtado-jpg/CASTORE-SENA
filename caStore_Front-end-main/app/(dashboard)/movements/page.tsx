'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Plus } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { Button } from '@/src/components/ui/Button';
import { useMovementsList } from '@/src/features/movements/hooks/useMovements';
import { MovementsList } from '@/src/features/movements/components/MovementsList/MovementsList';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';

export default function MovementsPage() {
  const {
    data: movements,
    pagination,
    isLoading,
    error,
    refetch,
    isUsingMock,
  } = useMovementsList({ page: 1, limit: 10, type: 'all' });

  const isEmpty = (pagination?.total ?? 0) === 0 && !isLoading;

  if (error && !isUsingMock) {
    return (
      <ProtectedPage module="movements">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar los movimientos</h3>
            <p>{String(error)}</p>
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
    <ProtectedPage module="movements">
      <div className={styles.container}>
        <PageWrapper
          title="Movimientos de Inventario"
          subtitle="Trazabilidad completa de entradas y salidas"
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
              <Link href="/movements/new" passHref legacyBehavior>
                <Button variant="primary">
                  <Plus size={16} />
                  Registrar movimiento
                </Button>
              </Link>
            </>
          }
        >
          {isUsingMock && <MockWarning />}
          {isLoading && movements.length === 0 ? (
            <SkeletonTable rows={6} columns={5} />
          ) : isEmpty ? (
            <EmptyState
              title="No hay movimientos"
              message="No se encontraron movimientos para mostrar."
              icon={<PackageSearch size={48} />}
              action={{ label: 'Reintentar', onClick: () => refetch() }}
            />
          ) : (
            <MovementsList />
          )}
        </PageWrapper>
      </div>
    </ProtectedPage>
  );
}
