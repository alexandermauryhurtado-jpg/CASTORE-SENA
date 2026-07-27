'use client';

import React from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './UsersList.module.css';
import { UserSummaryCards } from './UserSummaryCards';
import { UsersTable } from './UsersTable';
import { Button } from '@/src/components/ui/Button';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import type { User } from '@/src/features/users/types/users.types';

export interface UsersListFilterState {
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  roleFilter: string;
  setRoleFilter: (s: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (s: 'all' | 'active' | 'inactive') => void;
}

interface UsersListProps {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    from: number;
    to: number;
  } | null;
  roles: { id: string; name: string }[];
  isLoading: boolean;
  isUsingMock: boolean;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onRefresh: () => void;
  filterState: UsersListFilterState;
}

const DEFAULT_PAGE = 1;

export function UsersList({
  users,
  pagination,
  roles,
  onToggleStatus,
  filterState,
}: UsersListProps) {
  const {
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
  } = filterState;

  const hasFilters = searchTerm.trim() || roleFilter || statusFilter !== 'all';
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('all');
    setPage(DEFAULT_PAGE);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <Link href="/users/new">
          <Button type="button">
            <Plus size={18} />
            Crear usuario
          </Button>
        </Link>
      </div>

      <UserSummaryCards users={users} roleCount={roles.length} />

      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} aria-hidden />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(DEFAULT_PAGE);
            }}
            aria-label="Buscar por nombre o correo"
          />
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(DEFAULT_PAGE);
            }}
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(DEFAULT_PAGE);
            }}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearFilters}
              aria-label="Limpiar filtros"
            >
              <X size={14} aria-hidden />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <UsersTable users={users} onToggleStatus={onToggleStatus} />

      <div className={styles.footer}>
        <span className={styles.resultsCount}>
          {pagination
            ? `Mostrando ${pagination.from}-${pagination.to} de ${pagination.total} usuarios`
            : `Mostrando ${users.length} usuarios`}
        </span>
        {pagination && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.pageInfo}>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p: number) => p + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
