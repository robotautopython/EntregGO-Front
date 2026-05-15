'use client';

import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminMotoboysPage() {
  return (
    <OperationalShell
      role="admin"
      title="Central · Motoboys"
      searchPlaceholder="Buscar email do motoboy..."
      showSearch
    >
      {({ authContext, accessToken }) => (
        <AdminUsersPanel
          authContext={authContext}
          accessToken={accessToken}
          preset={{
            title: 'Motoboys cadastrados',
            eyebrow: 'Cadastros',
            description:
              'Lista filtrada de motoboys. Documentos (foto da moto, CNH) entram na aba do perfil após Security Validator aprovar o pipeline de Storage.',
            forcedRole: 'motoboy',
          }}
        />
      )}
    </OperationalShell>
  );
}
