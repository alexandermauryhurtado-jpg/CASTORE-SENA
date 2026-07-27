'use client';

import React, { useState } from 'react';
import { Search, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './SuppliersList.module.css';
import { SuppliersSummaryCards } from './SuppliersSummaryCards';
import { SuppliersTable } from './SuppliersTable';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Select';
import { Pagination } from '@/src/components/tables/Pagination';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { useSuppliersList } from '../../hooks/useSuppliers';
import type { SupplierTypeApi } from '../../types/suppliers.types';

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'NATIONAL', label: 'Nacional' },
  { value: 'INTERNATIONAL', label: 'Internacional' },
  { value: 'MANUFACTURER', label: 'Fabricante' },
  { value: 'DISTRIBUTOR', label: 'Distribuidor' },
];

export function SuppliersList() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const params: Parameters<typeof useSuppliersList>[0] = {
    page,
    limit,
    search: search.trim() || undefined,
    type: typeFilter === 'all' ? undefined : (typeFilter as SupplierTypeApi),
    city: cityFilter.trim() || undefined,
  };

  const { data, pagination, isLoading, isUsingMock, refetch } = useSuppliersList(params);

  const pag = pagination;

  return (
    <div className={styles.container}>
      {isUsingMock && <MockWarning />}
      <SuppliersSummaryCards suppliers={data} totalCount={pag?.total} />

      <div className={styles.actionBar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="Buscar por razón social, NIT o ciudad..."
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
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles.filterWrapper}>
            <Input
              placeholder="Ciudad"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles.exportSection}>
          <Button variant="secondary" className={styles.exportBtn}>
            <Download size={18} />
            Exportar CSV
          </Button>
          <Link href="/suppliers/new">
            <Button>
              <Plus size={18} />
              Crear proveedor
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <SuppliersTable suppliers={data} />
        {pag && pag.total > 0 && (
          <div className={styles.paginationBox}>
            <Pagination
              currentPage={pag.page}
              totalCount={pag.total}
              pageSize={pag.limit}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
