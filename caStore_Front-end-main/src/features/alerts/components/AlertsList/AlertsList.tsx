'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ShieldCheck, Eye, AlertTriangle, Calendar, CalendarClock } from 'lucide-react';
import styles from './AlertsList.module.css';
import type { Alert } from '../../types/alerts.types';
import { AlertSummaryCards } from './AlertSummaryCards';
import { AlertFilters } from './AlertFilters';
import { DataTable } from '@/src/components/tables/DataTable';
import { Pagination } from '@/src/components/tables/Pagination';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import {
  useAlertsList,
  useAlertsSummary,
  useResolveAlert,
  useDismissAlert,
  type AlertsListPagination,
} from '../../hooks/useAlerts';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';

export function AlertsList() {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [resolvingAlert, setResolvingAlert] = useState<Alert | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [dismissingAlert, setDismissingAlert] = useState<Alert | null>(null);
  const [dismissNote, setDismissNote] = useState('');

  const { summary, isLoading: summaryLoading, activeCount } = useAlertsSummary();
  const {
    alerts,
    pagination,
    isLoading: listLoading,
    isFetching,
    refresh,
  } = useAlertsList({
    page,
    limit: pageSize,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const resolveMutation = useResolveAlert();
  const dismissMutation = useDismissAlert();

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase().trim();
    return alerts.filter(
      (a) =>
        a.productName.toLowerCase().includes(q) || a.productSku.toLowerCase().includes(q)
    );
  }, [alerts, searchQuery]);

  const handleResolveSubmit = useCallback(async () => {
    if (!resolvingAlert) return;
    try {
      const result = await resolveMutation.mutateAsync({
        id: resolvingAlert.id,
        notes: resolutionNote.trim() || undefined,
      });
      if (result) {
        showToast({ message: 'Alerta resuelta con éxito', type: 'success' });
        setResolvingAlert(null);
        setResolutionNote('');
      } else {
        showToast({ message: 'No se pudo resolver la alerta', type: 'error' });
      }
    } catch {
      showToast({ message: 'Error al resolver la alerta', type: 'error' });
    }
  }, [resolvingAlert, resolutionNote, resolveMutation, showToast]);

  const handleDismissSubmit = useCallback(async () => {
    if (!dismissingAlert) return;
    try {
      const result = await dismissMutation.mutateAsync({
        id: dismissingAlert.id,
        notes: dismissNote.trim() || undefined,
      });
      if (result) {
        showToast({ message: 'Alerta descartada correctamente', type: 'success' });
        setDismissingAlert(null);
        setDismissNote('');
      } else {
        showToast({ message: 'No se pudo descartar la alerta', type: 'error' });
      }
    } catch {
      showToast({ message: 'Error al descartar la alerta', type: 'error' });
    }
  }, [dismissingAlert, dismissNote, dismissMutation, showToast]);

  const isResolving = resolveMutation.isPending;
  const isDismissing = dismissMutation.isPending;
  const isLoading = listLoading;

  const renderType = (alert: Alert) => {
    if (alert.type === 'LOW_STOCK' || alert.type === 'OUT_OF_STOCK') {
      return (
        <div className={styles.typeCell}>
          <div className={styles.iconRed}><AlertTriangle size={16} /></div>
          <span>{alert.type === 'OUT_OF_STOCK' ? 'Sin stock' : 'Stock bajo'}</span>
        </div>
      );
    }
    let iconClass = styles.iconYellow;
    let icon = <Calendar size={16} />;
    const days = alert.currentValue;
    if (days <= 7) {
      iconClass = styles.iconRed;
      icon = <CalendarClock size={16} />;
    } else if (days <= 15) {
      iconClass = styles.iconOrange;
    }
    return (
      <div className={styles.typeCell}>
        <div className={iconClass}>{icon}</div>
        <span>Venc. {days} días</span>
      </div>
    );
  };

  const renderStatus = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <div className={styles.pulseContainer}>
          <div className={styles.pulseRing} />
          <Badge variant="inactive">Activa</Badge>
        </div>
      );
    }
    if (status === 'RESOLVED') {
      return <Badge variant="active">Resuelta</Badge>;
    }
    return <Badge variant="default">Descartada</Badge>;
  };

  const columns = [
    { key: 'type', header: 'Tipo', render: renderType },
    {
      key: 'product',
      header: 'Producto',
      render: (a: Alert) => (
        <div className={styles.productCell}>
          <span className={styles.productName}>{a.productName}</span>
          <span className={styles.productSku}>{a.productSku}</span>
        </div>
      ),
    },
    {
      key: 'currentValue',
      header: 'Valor actual',
      render: (a: Alert) => (
        <span className={styles.boldValue}>
          {a.type === 'LOW_STOCK' || a.type === 'OUT_OF_STOCK'
            ? `${a.currentValue} unid.`
            : `${a.currentValue} días`}
        </span>
      ),
    },
    {
      key: 'threshold',
      header: 'Umbral',
      render: (a: Alert) => (
        <span className={styles.textMid}>
          {a.type === 'LOW_STOCK' || a.type === 'OUT_OF_STOCK'
            ? `Mín. ${a.threshold}`
            : `${a.threshold} días`}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Generación',
      render: (a: Alert) => {
        const d = new Date(a.createdAt);
        return (
          <span className={styles.textMid}>
            {d.toLocaleDateString()} {d.getHours()}:{d.getMinutes().toString().padStart(2, '0')}
          </span>
        );
      },
    },
    { key: 'status', header: 'Estado', render: (a: Alert) => renderStatus(a.status) },
    {
      key: 'actions',
      header: 'Acciones',
      render: (a: Alert) => (
        <div className={styles.actionsBox}>
          {a.status === 'ACTIVE' && (
            <>
              <Button
                variant="secondary"
                onClick={() => setResolvingAlert(a)}
                className={styles.smallBtn}
              >
                Resolver
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDismissingAlert(a)}
                className={styles.smallBtn}
              >
                Descartar
              </Button>
            </>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            title="Ver detalle"
            onClick={() => router.push(`/alerts/${a.id}`)}
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  const emptyState = (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <ShieldCheck size={48} />
      </div>
      <h3>Todo en orden</h3>
      <p>No hay alertas que coincidan con los filtros actuales.</p>
    </div>
  );

  const paginationInfo: AlertsListPagination | null = pagination;
  const totalCount = paginationInfo?.total ?? 0;

  return (
    <div className={styles.container}>
      <AlertSummaryCards summary={summary} isLoading={summaryLoading} />

      <div className={styles.filterBar}>
        <AlertFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />
        <Button variant="secondary" className={styles.exportBtn}>
          <Download size={16} /> Exportar CSV
        </Button>
      </div>

      {isLoading && filteredBySearch.length === 0 ? (
        <SkeletonTable rows={6} columns={5} />
      ) : (
        <>
          <DataTable
            data={filteredBySearch}
            columns={columns}
            loading={isFetching}
            emptyState={emptyState}
          />
          {paginationInfo && totalCount > 0 && !searchQuery.trim() && (
            <Pagination
              currentPage={page}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Modal Resolver */}
      <Modal
        isOpen={!!resolvingAlert}
        onClose={() => !isResolving && setResolvingAlert(null)}
        title="Resolver alerta"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setResolvingAlert(null)}
              disabled={isResolving}
            >
              Cancelar
            </Button>
            <Button onClick={handleResolveSubmit} isLoading={isResolving}>
              Confirmar resolución
            </Button>
          </>
        }
      >
        {resolvingAlert && (
          <div className={styles.modalContent}>
            <p className={styles.modalText}>¿Confirmas la resolución de esta alerta?</p>
            <div className={styles.productAlertInfo}>
              <strong>{resolvingAlert.productName}</strong> ({resolvingAlert.productSku})
              <br />
              <span className={styles.textMid}>
                {resolvingAlert.type === 'LOW_STOCK' || resolvingAlert.type === 'OUT_OF_STOCK'
                  ? `Stock actual: ${resolvingAlert.currentValue} (Mín: ${resolvingAlert.threshold})`
                  : `Vence en ${resolvingAlert.currentValue} días`}
              </span>
            </div>
            <Input
              label="Nota de resolución (opcional)"
              placeholder="Ej. Se reabasteció el producto"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              disabled={isResolving}
            />
          </div>
        )}
      </Modal>

      {/* Modal Descartar */}
      <Modal
        isOpen={!!dismissingAlert}
        onClose={() => !isDismissing && setDismissingAlert(null)}
        title="Descartar alerta"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDismissingAlert(null)}
              disabled={isDismissing}
            >
              Cancelar
            </Button>
            <Button onClick={handleDismissSubmit} isLoading={isDismissing}>
              Confirmar descarte
            </Button>
          </>
        }
      >
        {dismissingAlert && (
          <div className={styles.modalContent}>
            <p className={styles.modalText}>¿Descartar esta alerta sin resolverla?</p>
            <div className={styles.productAlertInfo}>
              <strong>{dismissingAlert.productName}</strong> ({dismissingAlert.productSku})
            </div>
            <Input
              label="Nota (opcional)"
              placeholder="Motivo del descarte"
              value={dismissNote}
              onChange={(e) => setDismissNote(e.target.value)}
              disabled={isDismissing}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
