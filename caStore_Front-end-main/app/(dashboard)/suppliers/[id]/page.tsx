'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { SupplierProfile } from '@/src/features/suppliers/components/SupplierProfile/SupplierProfile';
import { useSupplier } from '@/src/features/suppliers/hooks/useSuppliers';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';

export default function SupplierProfilePage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const { supplier, isLoading, error } = useSupplier(id);

  if (!id) {
    notFound();
  }

  if (error) {
    return (
      <ProtectedPage module="suppliers">
        <PageWrapper title="Error" subtitle="No se pudo cargar el proveedor">
          <p>{error.message}</p>
        </PageWrapper>
      </ProtectedPage>
    );
  }

  if (isLoading) {
    return (
      <ProtectedPage module="suppliers">
        <PageWrapper title="Perfil del Proveedor" subtitle="Cargando...">
          <SkeletonTable rows={6} columns={3} />
        </PageWrapper>
      </ProtectedPage>
    );
  }

  if (!supplier) {
    notFound();
  }

  return (
    <ProtectedPage module="suppliers">
      <PageWrapper
        title="Perfil del Proveedor"
        subtitle="Información detallada y resumen comercial"
      >
        <SupplierProfile supplier={supplier} />
      </PageWrapper>
    </ProtectedPage>
  );
}
