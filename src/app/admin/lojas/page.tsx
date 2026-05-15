'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminLojasPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Lojas"
      searchPlaceholder="Buscar email da loja..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel
          authContext={authContext}
          accessToken={accessToken}
          preset={{
            title: 'Lojas cadastradas',
            eyebrow: 'Cadastros',
            description:
              'Lista filtrada de logistas. Toque numa linha pra abrir o perfil ou use as ações inline.',
            forcedRole: 'logista',
          }}
        />
      )}
    </OperationalShell>
  );
}
