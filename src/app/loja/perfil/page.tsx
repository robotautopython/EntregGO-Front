'use client';

import { LojaPerfil } from '@/components/loja/LojaPerfil';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function LojaPerfilPage() {
  return (
    <OperationalShell role="logista" title="Perfil da loja">
      {({ authContext }) => <LojaPerfil authContext={authContext} />}
    </OperationalShell>
  );
}
