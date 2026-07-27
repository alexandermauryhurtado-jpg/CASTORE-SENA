'use client';

import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  User,
  Clock,
  UserCheck,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './MovementsTable.module.css';
import type { MovementWithDetails } from '../../types/movements.types';
import { useMovementById } from '../../hooks/useMovements';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';

const TYPE_CONFIG: Record<
  MovementWithDetails['type'],
  { label: string; badge: string; icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string; qtyClass: string; qtySign: string }
> = {
  PURCHASE_ENTRY: {
    label: 'Entrada por compra',
    badge: styles.badgeGreen,
    icon: ArrowDownToLine,
    iconColor: styles.iconGreen,
    qtyClass: styles.qtyPos,
    qtySign: '+',
  },
  SALE_EXIT: {
    label: 'Salida por venta',
    badge: styles.badgeRed,
    icon: ArrowUpFromLine,
    iconColor: styles.iconRed,
    qtyClass: styles.qtyNeg,
    qtySign: '-',
  },
  TRANSFER: {
    label: 'Transferencia',
    badge: styles.badgeBlue,
    icon: ArrowRightLeft,
    iconColor: styles.iconBlue,
    qtyClass: styles.qtyNeut,
    qtySign: '',
  },
  POSITIVE_ADJUSTMENT: {
    label: 'Ajuste positivo',
    badge: styles.badgeGreenLight,
    icon: PlusCircle,
    iconColor: styles.iconGreen,
    qtyClass: styles.qtyPos,
    qtySign: '+',
  },
  NEGATIVE_ADJUSTMENT: {
    label: 'Ajuste negativo',
    badge: styles.badgeOrange,
    icon: MinusCircle,
    iconColor: styles.iconOrange,
    qtyClass: styles.qtyNeg,
    qtySign: '-',
  },
  RETURN: {
    label: 'Devolución',
    badge: styles.badgePurple,
    icon: RotateCcw,
    iconColor: styles.iconPurple,
    qtyClass: styles.qtyPos,
    qtySign: '+',
  },
};

interface MovementsTableProps {
  movements: MovementWithDetails[];
  isLoading?: boolean;
}

function MovementDetailPanel({ movementId, onClose }: { movementId: string; onClose: () => void }) {
  const { movement, isLoading } = useMovementById(movementId);

  if (isLoading) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.detailHeader}>
          <h4>Detalles del Movimiento</h4>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar detalle">
            <X size={16} />
          </button>
        </div>
        <p className={styles.detailLoading}>Cargando...</p>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.detailHeader}>
          <h4>Detalles del Movimiento</h4>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar detalle">
            <X size={16} />
          </button>
        </div>
        <p className={styles.detailObs}>No se pudo cargar el detalle.</p>
      </div>
    );
  }

  const createdAt = typeof movement.createdAt === 'string' ? new Date(movement.createdAt) : movement.createdAt;

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h4>Detalles del Movimiento</h4>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar detalle">
          <X size={16} />
        </button>
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}><FileText size={14} /> Ref:</span>
          <span className={styles.detailValue}>{movement.docReference ?? '—'}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}><User size={14} /> Registrado por:</span>
          <span className={styles.detailValue}>{movement.registeredBy}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}><Clock size={14} /> Fecha exacta:</span>
          <span className={styles.detailValue}>{createdAt.toLocaleString()}</span>
        </div>
        {movement.supplierName && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}><UserCheck size={14} /> Proveedor:</span>
            <span className={styles.detailValue}>{movement.supplierName}</span>
          </div>
        )}
        {movement.lotNumber && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Lote</span>
            <span className={styles.detailValue}>{movement.lotNumber}</span>
          </div>
        )}
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Stock antes / después:</span>
          <span className={styles.detailValue}>{movement.stockBefore} → {movement.stockAfter}</span>
        </div>
        {movement.notes && (
          <div className={styles.detailItemFull}>
            <span className={styles.detailLabel}>Observaciones:</span>
            <p className={styles.detailObs}>{movement.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MovementsTable({ movements, isLoading }: MovementsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const columns: { key: string; header: string; render: (m: MovementWithDetails) => React.ReactNode }[] = [
    {
      key: 'id',
      header: 'ID',
      render: (m) => <code className={styles.idCode}>{m.id.slice(-8)}</code>,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (m) => {
        const config = TYPE_CONFIG[m.type];
        const Icon = config.icon;
        return (
          <div className={clsx(styles.typeBadge, config.badge)}>
            <Icon size={14} className={config.iconColor} />
            <span>{config.label}</span>
          </div>
        );
      },
    },
    {
      key: 'product',
      header: 'Producto',
      render: (m) => (
        <div className={styles.productCell}>
          <span className={styles.pName}>{m.productName}</span>
          <span className={styles.pSku}>{m.productSku}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (m) => {
        const config = TYPE_CONFIG[m.type];
        return (
          <span className={clsx(styles.qtyValue, config.qtyClass)}>
            {config.qtySign}{m.quantity}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: 'Ubicación',
      render: (m) => (
        <div className={styles.locationCell}>
          {m.type === 'TRANSFER' ? (
            <>
              <span>{m.fromLocationName ?? m.fromLocationCode ?? '—'}</span>
              <ArrowRightLeft size={12} className={styles.locArrow} />
              <span>{m.toLocationName ?? m.toLocationCode ?? '—'}</span>
            </>
          ) : (
            <span>{m.fromLocationName ?? m.toLocationName ?? m.fromLocationCode ?? m.toLocationCode ?? '—'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'document',
      header: 'Documento',
      render: (m) => <span className={styles.docCode}>{m.docReference ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (m) => {
        const d = typeof m.createdAt === 'string' ? new Date(m.createdAt) : m.createdAt;
        return (
          <div className={styles.dateCell}>
            <span>{d.toLocaleDateString()}</span>
            <span className={styles.timeText}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <button
          type="button"
          className={styles.expandBtn}
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(m.id);
          }}
          aria-expanded={expandedRow === m.id}
        >
          {expandedRow === m.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      ),
    },
  ];

  if (isLoading && movements.length === 0) {
    return <SkeletonTable rows={6} columns={columns.length} />;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <React.Fragment key={m.id}>
              <tr
                className={clsx(styles.row, { [styles.rowExpanded]: expandedRow === m.id })}
                onClick={() => toggleRow(m.id)}
              >
                {columns.map((col) => (
                  <td key={col.key}>{col.render(m)}</td>
                ))}
              </tr>
              {expandedRow === m.id && (
                <tr className={styles.detailRow}>
                  <td colSpan={columns.length}>
                    <div
                      className={styles.detailRowInner}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MovementDetailPanel movementId={m.id} onClose={() => setExpandedRow(null)} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
