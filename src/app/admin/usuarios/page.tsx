'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminUsuariosPage() {
  return (
    <OperationalShell
      role="admin"
      title="Usuarios"
      searchPlaceholder="Buscar email, loja, motoboy..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel authContext={authContext} accessToken={accessToken} />
      )}
    </OperationalShell>
  );
}
