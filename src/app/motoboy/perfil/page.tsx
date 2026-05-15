'use client';

import { MotoboyPerfil } from '@/components/motoboy/MotoboyPerfil';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function MotoboyPerfilPage() {
  return (
    <OperationalShell role="motoboy" title="Perfil">
      {({ authContext }) => <MotoboyPerfil authContext={authContext} />}
    </OperationalShell>
  );
}
