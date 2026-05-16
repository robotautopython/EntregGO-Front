'use client';

import { HistoricoEntregas } from '@/components/loja/HistoricoEntregas';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function LojaHistoricoPage() {
  return (
    <OperationalShell role="logista" title="Histórico">
      {({ accessToken }) => <HistoricoEntregas accessToken={accessToken} />}
    </OperationalShell>
  );
}
