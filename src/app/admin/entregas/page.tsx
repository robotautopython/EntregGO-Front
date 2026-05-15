'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminEntregasPage() {
  return (
    <OperationalShell role="admin" title="Entregas">
      <ComingSoonPanel
        eyebrow="Operacao"
        title="Entregas"
        description="Painel futuro para acompanhar corridas, aceite, expiracao e status."
        checkpoints={[
          'Contrato backend antes da UI real',
          'Aceite concorrente precisa de validacao de performance',
          'Status devem ser consistentes com o schema Supabase',
        ]}
      />
    </OperationalShell>
  );
}
