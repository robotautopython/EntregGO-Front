'use client';

import { AdminPaymentsPanel } from '@/components/admin/AdminPaymentsPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPagamentosPage() {
  return (
    <OperationalShell role="admin" title="Pagamentos">
      {({ accessToken }) => <AdminPaymentsPanel accessToken={accessToken} />}
    </OperationalShell>
  );
}
