import { RoleForm } from "@/src/features/users/components/RoleForm/RoleForm";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { Suspense } from "react";

export default function NewRolePage() {
  return (
    <PageWrapper
      title="" // Custom title in RoleForm
      subtitle=""
    >
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <RoleForm />
      </Suspense>
    </PageWrapper>
  );
}
