'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { UserForm } from '@/src/features/users/components/UserForm/UserForm';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';
import { useUser } from '@/src/features/users/hooks/useUsers';
import { notFound } from 'next/navigation';

export default function EditUserPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { user, isLoading } = useUser(id);

  if (!id) {
    notFound();
  }

  if (isLoading) {
    return (
      <ProtectedPage module="users">
        <PageWrapper title="Editar Usuario" subtitle="Cargando...">
          <SkeletonTable rows={8} columns={2} />
        </PageWrapper>
      </ProtectedPage>
    );
  }

  if (!user) {
    notFound();
  }

  return (
    <ProtectedPage module="users">
      <PageWrapper
        title="Editar Usuario"
        subtitle={`Gestionando permisos de ${user.name}`}
      >
        <UserForm initialData={user} isEdit />
      </PageWrapper>
    </ProtectedPage>
  );
}
