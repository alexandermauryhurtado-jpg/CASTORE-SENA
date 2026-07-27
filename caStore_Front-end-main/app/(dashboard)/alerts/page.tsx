'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { Button } from '@/src/components/ui/Button';
import { useAlerts } from '@/src/features/alerts/hooks/useAlerts';
import { AlertsList } from '@/src/features/alerts/components/AlertsList/AlertsList';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';

export default function AlertsPage() {
  const { alerts, isLoading, isUsingMock, error, refresh, isEmpty } = useAlerts();

  if (error && !isUsingMock) {
    return (
      <ProtectedPage module="alerts">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar las alertas</h3>
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
    <ProtectedPage module="alerts">
      <div className={styles.container}>
        <PageWrapper
          title="Alertas de Inventario"
          subtitle="Monitorea el estado crítico del inventario"
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
          {isUsingMock && <MockWarning />}
          {isLoading && !alerts?.length ? (
            <SkeletonTable rows={6} columns={5} />
          ) : isEmpty ? (
            <EmptyState
              title="No hay alertas"
              message="No se encontraron alertas activas en este momento."
              icon={<PackageSearch size={48} />}
              action={{ label: 'Reintentar', onClick: refresh }}
            />
          ) : (
            <AlertsList />
          )}
        </PageWrapper>
      </div>
    </ProtectedPage>
  );
}
