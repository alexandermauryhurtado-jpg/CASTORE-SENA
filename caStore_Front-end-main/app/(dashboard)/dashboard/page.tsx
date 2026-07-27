'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, 
  Package, 
  Bell, 
  ArrowLeftRight, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import { useDashboard } from '../../../src/features/dashboard/hooks/useDashboard';
import { KPICard } from '../../../src/features/dashboard/components/KPICard';
import { MovementsChart } from '../../../src/features/dashboard/components/MovementsChart';
import { StockByCategoryChart } from '../../../src/features/dashboard/components/StockByCategoryChart';
import { RecentAlertsList } from '../../../src/features/dashboard/components/RecentAlertsList';
import { RecentProductsList } from '../../../src/features/dashboard/components/RecentProductsList';
import { DashboardSkeleton } from '../../../src/features/dashboard/components/DashboardSkeleton';
import { formatCOP } from '../../../src/utils/format';
import { clsx } from 'clsx';
import styles from './page.module.css';
import { ProtectedPage } from '../../../src/features/auth/components/ProtectedPage';
import { MockWarning } from '../../../src/components/common/MockWarning/MockWarning';
import { EmptyState } from '../../../src/components/common/EmptyState/EmptyState';
import { PackageSearch } from 'lucide-react';
import { useToast } from '../../../src/components/ui/Toast';

export default function DashboardPage() {
  const { data, isLoading, error, isUsingMock, isEmpty, refresh, isRefetching } = useDashboard();
  const router = useRouter();
  const { showToast } = useToast();

  const handleRefresh = useCallback(async () => {
    const result = await refresh();
    if (result?.isError) {
      showToast({ message: 'No se pudo actualizar. Mostrando datos en caché.', type: 'error' });
    } else {
      showToast({ message: 'Datos actualizados correctamente', type: 'success' });
    }
  }, [refresh, showToast]);

  if (error && !isUsingMock && !data) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h3>Error al cargar el dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage module="dashboard">
      <div className={styles.container}>
        {isUsingMock && <MockWarning />}
        
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Panel de Control</h1>
            <p className={styles.subtitle}>Resumen general del estado del inventario</p>
          </div>
          <button 
            className={clsx(styles.refreshBtn, (isLoading || isRefetching) && styles.spinning)} 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={18} />
            <span>Actualizar</span>
          </button>
        </header>

        {isLoading && !data ? (
          <DashboardSkeleton />
        ) : isEmpty ? (
          <EmptyState 
            title="No hay datos disponibles" 
            message="No se han encontrado registros para mostrar en el dashboard actualmente."
            icon={<PackageSearch size={48} />}
            action={{ label: 'Reintentar actualización', onClick: handleRefresh }}
          />
        ) : (
          data && (
            <div className={styles.content}>
              {/* Rent of the dashboard content ... */}
              {/* KPI Cards */}
              <section className={styles.kpiGrid}>
                <KPICard
                  title="Productos Activos"
                  value={data.kpis.products.active}
                  subtitle={`de ${data.kpis.products.total} registrados`}
                  icon={<Package size={22} />}
                  iconColor="var(--color-primary)"
                  iconBg="var(--color-primary-soft)"
                  onClick={() => router.push('/products')}
                />
                <KPICard
                  title="Alertas Activas"
                  value={data.kpis.alerts.active}
                  subtitle={`${data.kpis.alerts.critical} críticas`}
                  icon={<Bell size={22} />}
                  iconColor="var(--color-error)"
                  iconBg="#FEE2E2"
                  trend={data.kpis.alerts.active > 0 ? {
                    value: Math.round((data.kpis.alerts.critical / data.kpis.alerts.active) * 100),
                    label: 'son críticas',
                    direction: 'down'
                  } : undefined}
                  onClick={() => router.push('/alerts')}
                />
                <KPICard
                  title="Movimientos Hoy"
                  value={data.kpis.movements.totalToday}
                  subtitle={`${data.kpis.movements.entriesToday} entradas · ${data.kpis.movements.exitsToday} salidas`}
                  icon={<ArrowLeftRight size={22} />}
                  iconColor="var(--color-info)"
                  iconBg="#DBEAFE"
                  onClick={() => router.push('/movements')}
                />
                <KPICard
                  title="Valor Inventario"
                  value={formatCOP(data.kpis.products.totalInventoryValue)}
                  subtitle={`${data.kpis.products.outOfStock} items sin stock`}
                  icon={<DollarSign size={22} />}
                  iconColor="var(--color-success)"
                  iconBg="#DCFCE7"
                  onClick={() => router.push('/products')}
                />
              </section>

              {/* Charts Row */}
              <section className={styles.chartRow}>
                <div className={clsx(styles.card, styles.largeChart)}>
                  <h3 className={styles.cardTitle}>Movimientos — últimos 30 días</h3>
                  <MovementsChart data={data.charts.movementsByDay} isLoading={isLoading} />
                </div>
                <div className={clsx(styles.card, styles.smallChart)}>
                  <h3 className={styles.cardTitle}>Stock por categoría</h3>
                  <StockByCategoryChart data={data.charts.stockByCategory} isLoading={isLoading} />
                </div>
              </section>

              {/* Widgets Row */}
              <section className={styles.widgetRow}>
                <div className={styles.widget}>
                  <RecentAlertsList alerts={data.widgets.recentAlerts} isLoading={isLoading} />
                </div>
                <div className={styles.widget}>
                  <RecentProductsList products={data.widgets.recentProducts} isLoading={isLoading} />
                </div>
              </section>
            </div>
          )
        )}
      </div>
    </ProtectedPage>
  );
}
