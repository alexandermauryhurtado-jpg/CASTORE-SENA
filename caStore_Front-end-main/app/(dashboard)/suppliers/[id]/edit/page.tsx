'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SupplierWizard } from '@/src/features/suppliers/components/SupplierForm/SupplierWizard';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';
import { useSupplier } from '@/src/features/suppliers/hooks/useSuppliers';
import { SkeletonTable } from '@/src/components/common/Skeleton/SkeletonTable';

export default function EditSupplierPage() {
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

  if (isLoading || !supplier) {
    return (
      <ProtectedPage module="suppliers">
        <PageWrapper title="Editar Proveedor" subtitle="Cargando...">
          <SkeletonTable rows={6} columns={3} />
        </PageWrapper>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="suppliers">
      <PageWrapper
        title="Editar Proveedor"
        subtitle={`Actualizando información de ${supplier.tradeName}`}
      >
        <SupplierWizard initialData={supplier} isEdit />
      </PageWrapper>
    </ProtectedPage>
  );
}
