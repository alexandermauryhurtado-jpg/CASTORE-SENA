'use client';

import { SupplierWizard } from '@/src/features/suppliers/components/SupplierForm/SupplierWizard';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';

export default function NewSupplierPage() {
  return (
    <ProtectedPage module="suppliers">
      <PageWrapper
        title="Crear Proveedor"
        subtitle="Registra un nuevo proveedor en el sistema paso a paso"
      >
        <SupplierWizard />
      </PageWrapper>
    </ProtectedPage>
  );
}
