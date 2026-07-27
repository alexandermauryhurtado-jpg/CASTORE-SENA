'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { RoleForm } from '@/src/features/users/components/RoleForm/RoleForm';
import { useRole } from '@/src/features/roles/hooks/useRoles';
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

export default function EditRolePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const { role, isLoading, error } = useRole(id);

  if (!id) notFound();

  if (isLoading && !role) {
    return (
      <PageWrapper title="Editar rol" subtitle="">
        <SkeletonGrid count={6} />
      </PageWrapper>
    );
  }

  if (error || !role) notFound();

  return (
    <PageWrapper title="" subtitle="">
      <RoleForm initialData={roleViewToRole(role)} isEdit roleId={id} />
    </PageWrapper>
  );
}
