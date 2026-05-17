'use client';

import { useParams } from 'next/navigation';

import { AdminDeliveryDetailPanel } from '@/components/admin/AdminDeliveryDetailPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminEntregaDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const deliveryId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  return (
    <OperationalShell role="admin" title="Entrega">
      {({ accessToken }) => (
        <AdminDeliveryDetailPanel accessToken={accessToken} deliveryId={deliveryId} />
      )}
    </OperationalShell>
  );
}
