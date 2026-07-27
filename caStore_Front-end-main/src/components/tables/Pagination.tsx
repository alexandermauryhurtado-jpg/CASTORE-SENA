import React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50]
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalCount === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Calculate visible pages (max 5)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span>
          Mostrando {startItem}-{endItem} de {totalCount}
        </span>
        <div className={styles.pageSizeWrapper}>
          <label htmlFor="pageSize">Mostrar</label>
          <select
            id="pageSize"
            className={styles.select}
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.navButton}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        
        {pages.map((p) => (
          <button
            key={p}
            className={clsx(styles.pageButton, { [styles.active]: p === currentPage })}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className={styles.navButton}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Siguiente página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
