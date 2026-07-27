'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonGrid } from '@/src/components/common/Skeleton/SkeletonGrid';
import { useLocations } from '@/src/features/locations/hooks/useLocations';
import LocationsPage from '@/src/features/locations/components/LocationsPage/LocationsPage';
import { AlertCircle, MapPin } from 'lucide-react';
import styles from './page.module.css';

export default function LocationsPageRoute() {
  const { locations, isLoading, isUsingMock, error, refresh, isEmpty } = useLocations();

  if (error && !isUsingMock) {
    return (
      <ProtectedPage module="locations">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar las ubicaciones</h3>
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
    <ProtectedPage module="locations">
      <div className={styles.container}>
        {isUsingMock && <MockWarning />}
        {isLoading && !locations?.length ? (
          <SkeletonGrid count={8} />
        ) : isEmpty ? (
          <EmptyState
            title="No hay ubicaciones"
            message="No se encontraron ubicaciones en el almacén."
            icon={<MapPin size={48} />}
            action={{ label: 'Reintentar', onClick: refresh }}
          />
        ) : (
          <LocationsPage />
        )}
      </div>
    </ProtectedPage>
  );
}
