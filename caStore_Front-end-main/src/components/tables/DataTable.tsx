import React from 'react';
import clsx from 'clsx';
import styles from './DataTable.module.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading,
  emptyState
}: DataTableProps<T>) {

  if (loading) {
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
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`}>
                {columns.map((col) => (
                  <td key={`skeleton-td-${col.key}`}>
                    <div className={styles.shimmer} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={styles.emptyStateContainer}>
        {emptyState}
      </div>
    );
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
          {data.map((item) => (
            <tr key={item.id} className={styles.row}>
              {columns.map((col) => (
                <td key={`${item.id}-${col.key}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
