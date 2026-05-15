'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminUsuariosPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Usuários"
      searchPlaceholder="Buscar por email..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel
          authContext={authContext}
          accessToken={accessToken}
          preset={{
            title: 'Todos os usuários',
            eyebrow: 'Cadastros',
            description:
              'Lista completa com filtros por perfil e status. Toque numa linha para abrir o perfil detalhado.',
          }}
        />
      )}
    </OperationalShell>
  );
}
