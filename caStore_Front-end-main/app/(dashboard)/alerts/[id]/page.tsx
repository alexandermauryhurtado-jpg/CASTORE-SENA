import { AlertDetail } from "@/src/features/alerts/components/AlertDetail/AlertDetail";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { Button } from "@/src/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { mockAlerts } from "@/src/features/alerts/mockData";
import { notFound } from "next/navigation";

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const alert = mockAlerts.find(a => a.id === params.id);
  
  if (!alert) {
    return notFound();
  }

  return (
    <PageWrapper
      title="Detalle de alerta"
      subtitle={alert.status === 'active' ? 'Revisión crítica solicitada' : 'Historial de revisión'}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/alerts">
            <Button variant="secondary">
              <ArrowLeft size={16} /> Volver
            </Button>
          </Link>
          {alert.status === 'active' && (
            <Button>
              <CheckCircle size={16} style={{ marginRight: '8px' }} />
              Resolver alerta
            </Button>
          )}
        </div>
      }
    >
      <AlertDetail id={params.id} />
    </PageWrapper>
  );
}
