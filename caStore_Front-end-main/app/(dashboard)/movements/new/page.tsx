'use client';

import { RegisterMovementForm } from '@/src/features/movements/components/RegisterMovement/RegisterMovementForm';
import { PageWrapper } from '@/src/components/layout/PageWrapper';
import { ProtectedPage } from '@/src/features/auth/components/ProtectedPage';

export default function NewMovementPage() {
  return (
    <ProtectedPage module="movements">
      <PageWrapper
        title="Registrar movimiento"
        subtitle="Define el tipo e identifica el producto para el registro"
      >
        <RegisterMovementForm />
      </PageWrapper>
    </ProtectedPage>
  );
}
