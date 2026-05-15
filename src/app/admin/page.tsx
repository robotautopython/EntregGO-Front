'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Cadastros"
      searchPlaceholder="Buscar email, loja, motoboy..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel authContext={authContext} accessToken={accessToken} />
      )}
    </OperationalShell>
  );
}
