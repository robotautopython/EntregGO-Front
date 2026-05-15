'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminEntregasPage() {
  return (
    <OperationalShell role="admin" title="Entregas">
      <ComingSoonPanel
        eyebrow="Operação"
        title="Histórico de entregas da rede"
        description="Lista de todas as solicitações criadas pelas lojas, com status, motoboy responsável e tempos. Depende de endpoint backend que ainda não existe."
        checkpoints={[
          'Endpoint GET /api/admin/deliveries não implementado ainda',
          'Aceite concorrente exige Performance Validator antes da UI ligada',
          'Status seguem o enum delivery_status já criado na M-01',
        ]}
      />
    </OperationalShell>
  );
}
