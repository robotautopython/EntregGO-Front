'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Visão geral"
      searchPlaceholder="Buscar por email..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel
          authContext={authContext}
          accessToken={accessToken}
          preset={{
            title: 'Visão geral da rede',
            eyebrow: 'Central',
            description:
              'Lista de todos os cadastros que passam pela central. Aprovações pendentes pulsam — toque numa linha para abrir o perfil.',
          }}
        />
      )}
    </OperationalShell>
  );
}
