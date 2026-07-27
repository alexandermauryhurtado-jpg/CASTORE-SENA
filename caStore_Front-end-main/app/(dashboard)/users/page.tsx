'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { Button } from '@/src/components/ui/Button';
import { useUsersList, useRolesForSelect, useUpdateUserStatus } from '@/src/features/users/hooks/useUsers';
import { UsersList } from '@/src/features/users/components/UsersList/UsersList';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';
import { useToast } from '@/src/components/ui/Toast';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function UsersPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const params = {
    page,
    limit: DEFAULT_LIMIT,
    search: searchTerm.trim() || undefined,
    roleId: roleFilter || undefined,
    status: statusFilter,
  };

  const { data: users, pagination, isLoading, isUsingMock, error, refetch } = useUsersList(params);
  const { roles } = useRolesForSelect();
  const updateStatusMutation = useUpdateUserStatus({
    onSuccess: (user) => {
      if (user) {
        showToast({
          message:
            user.status === 'active'
              ? 'Usuario activado correctamente'
              : 'Usuario desactivado correctamente',
          type: 'success',
        });
      } else {
        showToast({
          message: 'No se pudo actualizar el estado. Usando datos locales.',
          type: 'info',
        });
      }
    },
    onError: () => {
      showToast({ message: 'Error al actualizar el estado del usuario', type: 'error' });
    },
  });

  const handleToggleStatus = useCallback(
    (id: string, currentStatus: string) => {
      updateStatusMutation.mutate({ id, isActive: currentStatus !== 'active' });
    },
    [updateStatusMutation]
  );

  if (error && !isUsingMock) {
    return (
      <ProtectedPage module="users">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar los usuarios</h3>
            <p>{String(error)}</p>
            <button type="button" onClick={() => refetch()} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="users">
      <div className={styles.container}>
        <PageWrapper
          title="Gestión de Usuarios"
          subtitle="Administra el acceso y permisos del equipo"
          actions={
            <>
              <button
                type="button"
                className={clsx(styles.refreshBtn, isLoading && styles.spinning)}
                onClick={() => refetch()}
                disabled={isLoading}
                aria-label="Actualizar listado"
              >
                <RefreshCw size={18} />
                <span>Actualizar</span>
              </button>
              <Link href="/users/new">
                <Button type="button" variant="primary">
                  <Plus size={16} />
                  Crear usuario
                </Button>
              </Link>
            </>
          }
        >
          {isUsingMock && <MockWarning />}
          {isLoading && !users.length ? (
            <SkeletonTable rows={6} columns={7} />
          ) : !users.length ? (
            <EmptyState
              title="No hay usuarios"
              message="No se encontraron usuarios registrados."
              icon={<PackageSearch size={48} />}
              action={{ label: 'Reintentar', onClick: () => refetch() }}
            />
          ) : (
            <UsersList
              users={users}
              pagination={pagination}
              roles={roles}
              isLoading={isLoading}
              isUsingMock={isUsingMock}
              onToggleStatus={handleToggleStatus}
              onRefresh={refetch}
              filterState={{
                page,
                setPage,
                searchTerm,
                setSearchTerm,
                roleFilter,
                setRoleFilter,
                statusFilter,
                setStatusFilter,
              }}
            />
          )}
        </PageWrapper>
      </div>
    </ProtectedPage>
  );
}
