'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus } from 'lucide-react';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { MockWarning } from '@/src/components/common/MockWarning/MockWarning';
import { EmptyState } from '@/src/components/common/EmptyState/EmptyState';
import { SkeletonGrid } from '@/src/components/common/Skeleton/SkeletonGrid';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { useRoles, useDeleteRole, useCloneRole } from '@/src/features/roles/hooks/useRoles';
import { getRoleErrorMessage } from '@/src/services/roles.service';
import { RoleGrid } from '@/src/features/roles/components/RoleGrid';
import { CloneRoleModal } from '@/src/features/users/components/RolesList/CloneRoleModal';
import type { RoleView } from '@/src/features/roles/types/roles.types';
import { AlertCircle, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './page.module.css';

export default function RolesPage() {
  const { showToast } = useToast();
  const { roles, isLoading, isUsingMock, error, refresh, isEmpty } = useRoles();
  const deleteRole = useDeleteRole({
    onSuccess: () => showToast({ message: 'Rol desactivado correctamente', type: 'success' }),
    onError: (err) => showToast({ message: getRoleErrorMessage(err), type: 'error' }),
  });
  const cloneRole = useCloneRole({
    onSuccess: (data) => {
      showToast({ message: 'Rol clonado correctamente', type: 'success' });
      setRoleToClone(null);
      if (data?.id) window.location.href = `/roles/${data.id}/edit`;
    },
    onError: (err) => showToast({ message: getRoleErrorMessage(err), type: 'error' }),
  });
  const [roleToClone, setRoleToClone] = useState<RoleView | null>(null);

  const handleDelete = (id: string) => {
    deleteRole.mutate(id);
  };

  const handleClone = (role: RoleView) => {
    setRoleToClone(role);
  };

  if (error && !isUsingMock) {
    return (
      <ProtectedPage module="roles">
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error al cargar los roles</h3>
            <p>{error}</p>
            <button type="button" onClick={() => refresh()} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="roles">
      <div className={styles.container}>
        <PageWrapper
          title="Roles y Permisos"
          subtitle="Define los niveles de acceso para cada tipo de usuario"
          actions={
            <>
              <button
                type="button"
                className={clsx(styles.refreshBtn, isLoading && styles.spinning)}
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw size={18} />
                <span>Actualizar</span>
              </button>
              <Link href="/roles/new" passHref legacyBehavior>
                <Button variant="primary">
                  <Plus size={16} />
                  Crear rol
                </Button>
              </Link>
            </>
          }
        >
          {isUsingMock && <MockWarning />}
          {isLoading && !roles?.length ? (
            <SkeletonGrid count={6} />
          ) : isEmpty ? (
            <EmptyState
              title="No hay roles"
              message="No se encontraron roles configurados."
              icon={<Shield size={48} />}
              action={{ label: 'Reintentar', onClick: () => refresh() }}
            />
          ) : (
            <RoleGrid roles={roles} onDelete={handleDelete} onClone={handleClone} />
          )}
        </PageWrapper>
      </div>

      {roleToClone && (
        <CloneRoleModal
          role={{
            id: roleToClone.id,
            name: roleToClone.name,
            description: roleToClone.description,
            type: roleToClone.type,
            userCount: roleToClone.userCount,
            permissions: roleToClone.permissions,
            createdAt: roleToClone.createdAt,
            lastModified: roleToClone.lastModified,
            modifiedBy: roleToClone.modifiedBy,
          }}
          onClose={() => setRoleToClone(null)}
          onClone={(name) => cloneRole.mutate({ id: roleToClone.id, name })}
          isLoading={cloneRole.isPending}
        />
      )}
    </ProtectedPage>
  );
}
