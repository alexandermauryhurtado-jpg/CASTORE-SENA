'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { RoleDetail } from '@/src/features/users/components/RoleDetail/RoleDetail';
import { CloneRoleModal } from '@/src/features/users/components/RolesList/CloneRoleModal';
import { useToast } from '@/src/components/ui/Toast';
import { useRole, useDeleteRole, useCloneRole } from '@/src/features/roles/hooks/useRoles';
import { getRoleErrorMessage } from '@/src/services/roles.service';
import { SkeletonGrid } from '@/src/components/common/Skeleton/SkeletonGrid';
import type { Role } from '@/src/features/users/mockData';

function roleViewToRole(role: NonNullable<ReturnType<typeof useRole>['role']>): Role {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    type: role.type,
    userCount: role.userCount,
    permissions: role.permissions,
    createdAt: role.createdAt,
    lastModified: role.lastModified,
    modifiedBy: role.modifiedBy,
  };
}

export default function RoleDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const { showToast } = useToast();
  const { role, isLoading, error } = useRole(id);
  const deleteRole = useDeleteRole({
    onSuccess: () => {
      showToast({ message: 'Rol desactivado correctamente', type: 'success' });
      window.location.href = '/roles';
    },
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
  const [roleToClone, setRoleToClone] = useState<Role | null>(null);

  if (!id) notFound();

  if (isLoading && !role) {
    return (
      <PageWrapper title="Detalle del rol" subtitle="">
        <SkeletonGrid count={4} />
      </PageWrapper>
    );
  }

  if (error || !role) notFound();

  const roleAsRole = roleViewToRole(role);

  return (
    <>
      <PageWrapper title="" subtitle="">
        <RoleDetail
          role={roleAsRole}
          onDelete={(roleId) => deleteRole.mutate(roleId)}
          onClone={(r) => setRoleToClone(r)}
        />
      </PageWrapper>
      {roleToClone && (
        <CloneRoleModal
          role={roleToClone}
          onClose={() => setRoleToClone(null)}
          onClone={(name) => cloneRole.mutate({ id: roleToClone.id, name })}
          isLoading={cloneRole.isPending}
        />
      )}
    </>
  );
}
