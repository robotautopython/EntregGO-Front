'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminAprovacoesPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Aprovações"
      searchPlaceholder="Buscar email pendente..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel
          authContext={authContext}
          accessToken={accessToken}
          preset={{
            title: 'Aprovações pendentes',
            eyebrow: 'Central',
            description:
              'Fila dedicada de cadastros aguardando revisão. Cada linha tem ações inline para aprovar ou bloquear.',
            forcedStatus: 'pendente',
          }}
        />
      )}
    </OperationalShell>
  );
}
