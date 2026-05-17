'use client';

import { AdminDeliveriesPanel } from '@/components/admin/AdminDeliveriesPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminEntregasPage() {
  return (
    <OperationalShell role="admin" title="Entregas">
      {({ accessToken }) => <AdminDeliveriesPanel accessToken={accessToken} />}
    </OperationalShell>
  );
}
