import { AlertConfig } from "@/src/features/alerts/components/AlertConfig/AlertConfig";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { Button } from "@/src/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AlertConfigPage() {
  return (
    <PageWrapper
      title="Configurar alerta"
      subtitle="Define los parámetros para el monitoreo automatizado de productos"
      actions={
        <Link href="/alerts">
          <Button variant="secondary">
            <ArrowLeft size={16} /> Volver a Alertas
          </Button>
        </Link>
      }
    >
      <AlertConfig />
    </PageWrapper>
  );
}
