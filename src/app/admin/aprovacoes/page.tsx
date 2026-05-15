'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminAprovacoesPage() {
  return (
    <OperationalShell role="admin" title="Aprovacoes">
      <ComingSoonPanel
        eyebrow="Central"
        title="Aprovacoes"
        description="Fila dedicada para revisar cadastros pendentes de lojas e motoboys."
        checkpoints={[
          'Reaproveitar as acoes admin ja existentes',
          'Manter paginacao e filtros antes de volume real',
          'Registrar auditoria de aprovacao no backend',
        ]}
      />
    </OperationalShell>
  );
}
