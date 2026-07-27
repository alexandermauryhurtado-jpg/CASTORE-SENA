'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './MovementsList.module.css';
import { MovementSummaryCards } from './MovementSummaryCards';
import { MovementsTable } from './MovementsTable';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Select';
import { Pagination } from '@/src/components/tables/Pagination';
import { useMovementsList } from '../../hooks/useMovements';
import type { MovementTypeApi } from '../../types/movements.types';
import { useDebounce } from '@/src/hooks/useDebounce';

export function MovementsList() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementTypeApi | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: movements,
    pagination,
    isLoading,
    isFetching,
    refetch,
    isUsingMock,
  } = useMovementsList({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    type: typeFilter,
  });

  const periodTotals = React.useMemo(() => {
    const entries = movements.filter((m) =>
      ['PURCHASE_ENTRY', 'POSITIVE_ADJUSTMENT', 'RETURN'].includes(m.type)
    ).reduce((acc, curr) => acc + curr.quantity, 0);
    const exits = movements.filter((m) =>
      ['SALE_EXIT', 'NEGATIVE_ADJUSTMENT'].includes(m.type)
    ).reduce((acc, curr) => acc + curr.quantity, 0);
    return { entries, exits, balance: entries - exits };
  }, [movements]);

  return (
    <div className={styles.container}>
      <MovementSummaryCards />

      <div className={styles.actionBar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="Buscar por producto, SKU o documento..."
              icon={Search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className={styles.filterWrapper}>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter((e.target.value as MovementTypeApi | 'all'));
                setPage(1);
              }}
            >
              <option value="all">Todos los tipos</option>
              <option value="PURCHASE_ENTRY">Entrada por compra</option>
              <option value="SALE_EXIT">Salida por venta</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="POSITIVE_ADJUSTMENT">Ajuste positivo</option>
              <option value="NEGATIVE_ADJUSTMENT">Ajuste negativo</option>
              <option value="RETURN">Devolución</option>
            </Select>
          </div>
        </div>

        <div className={styles.exportSection}>
          <Link href="/movements/new">
            <Button>
              <Plus size={18} />
              Registrar movimiento
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <MovementsTable
          movements={movements}
          isLoading={isLoading || isFetching}
        />

        <div className={styles.footerSummary}>
          <div className={styles.periodLabel}>Resumen del período filtrado:</div>
          <div className={styles.totalsRow}>
            <div className={styles.totalItem}>
              <span>Total Entradas:</span>
              <strong className={styles.entryColor}>+{periodTotals.entries}</strong>
            </div>
            <div className={styles.totalItem}>
              <span>Total Salidas:</span>
              <strong className={styles.exitColor}>-{periodTotals.exits}</strong>
            </div>
            <div className={styles.totalItem}>
              <span>Balance Neto:</span>
              <strong className={periodTotals.balance >= 0 ? styles.entryColor : styles.exitColor}>
                {periodTotals.balance >= 0 ? '+' : ''}{periodTotals.balance}
              </strong>
            </div>
          </div>
        </div>

        {pagination && (
          <div className={styles.paginationBox}>
            <Pagination
              currentPage={pagination.page}
              totalCount={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
