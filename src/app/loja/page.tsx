'use client';

import { LojaHome } from '@/components/loja/LojaHome';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function LojaPage() {
  return (
    <OperationalShell role="logista" title="Painel da loja">
      {({ authContext }) => <LojaHome authContext={authContext} />}
    </OperationalShell>
  );
}
