'use client';

import React from 'react';
import { UserForm } from '@/src/features/users/components/UserForm/UserForm';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';

export default function NewUserPage() {
  return (
    <ProtectedPage module="users">
      <PageWrapper
        title="Crear Usuario"
        subtitle="Define los accesos para un nuevo miembro del equipo"
      >
        <UserForm />
      </PageWrapper>
    </ProtectedPage>
  );
}
