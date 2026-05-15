'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPagamentosPage() {
  return (
    <OperationalShell role="admin" title="Pagamentos">
      <ComingSoonPanel
        eyebrow="Operacao"
        title="Pagamentos"
        description="Area reservada para controles internos de pagamento e conciliacao."
        checkpoints={[
          'Validar LGPD e dados financeiros antes de implementar',
          'Manter dados financeiros fora de logs',
          'Definir contrato backend antes da tela operacional',
        ]}
      />
    </OperationalShell>
  );
}
