'use client';

import React, { useMemo } from 'react';
import { Edit3, Trash2, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import type { Location } from '../../types/locations.types';
import { useLocationsList } from '../../hooks/useLocations';
import styles from './LocationList.module.css';

interface LocationListProps {
  searchTerm: string;
  typeFilter: string;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function LocationList({
  searchTerm,
  typeFilter,
  onEdit,
  onDelete,
  isDeleting = false,
}: LocationListProps) {
  const { data: locations, pagination, isLoading } = useLocationsList({
    page: 1,
    limit: 500,
    search: searchTerm || undefined,
    type: typeFilter === 'all' ? undefined : (typeFilter as Location['type']),
  });

  const getParentPath = (parentId?: string | null) => {
    if (!parentId) return '—';
    const parent = locations.find((l) => l.id === parentId);
    return parent ? parent.code : '—';
  };

  const getProgressColor = (percent: number) => {
    if (percent > 90) return styles.bgRed;
    if (percent > 70) return styles.bgYellow;
    return styles.bgGreen;
  };

  const canDelete = (loc: Location) =>
    (loc.productCount ?? 0) === 0 && (loc.childCount ?? 0) === 0;

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Padre</th>
            <th>Capacidad</th>
            <th>Productos</th>
            <th>Ocupación</th>
            <th className={styles.center}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td className={styles.code}>{loc.code}</td>
              <td className={styles.name}>{loc.name}</td>
              <td>
                <span className={clsx(styles.badge, (styles as Record<string, string>)[loc.type.toLowerCase()])}>
                  {loc.type}
                </span>
              </td>
              <td className={styles.parentId}>{getParentPath(loc.parentId)}</td>
              <td>{loc.capacity ?? '—'}</td>
              <td>
                {loc.productCount > 0 ? (
                  <div className={styles.productLink}>
                    <span>{loc.productCount}</span>
                    <ExternalLink size={12} />
                  </div>
                ) : (
                  '0'
                )}
              </td>
              <td>
                <div className={styles.occupancyWrapper}>
                  <div className={styles.progressBar}>
                    <div
                      className={clsx(styles.progressFill, getProgressColor(loc.occupancyPercent))}
                      style={{ width: `${Math.min(100, loc.occupancyPercent)}%` }}
                    />
                  </div>
                  <span className={styles.percentText}>{loc.occupancyPercent}%</span>
                </div>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    title="Editar"
                    onClick={() => onEdit(loc)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.actionBtn, styles.delete)}
                    title="Desactivar"
                    disabled={!canDelete(loc) || isDeleting}
                    onClick={() => canDelete(loc) && onDelete(loc.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {locations.length === 0 && (
        <p className={styles.emptyList}>No hay ubicaciones que coincidan con los filtros.</p>
      )}
    </div>
  );
}
