'use client';

import React from 'react';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProfilePage } from '@/src/features/profile/components/ProfilePage/ProfilePage';

export default function ProfileRoute() {
  return (
    <PageWrapper
      title="Mi Perfil"
      subtitle="Gestiona tu información personal y seguridad"
    >
      <ProfilePage />
    </PageWrapper>
  );
}
