'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminMotoboysPage() {
  return (
    <OperationalShell role="admin" title="Motoboys">
      <ComingSoonPanel
        eyebrow="Cadastros"
        title="Motoboys"
        description="Central para acompanhar motoboys, status operacional e documentos."
        checkpoints={[
          'Preparar contrato de listagem paginada',
          'Separar dados sensiveis de documentos',
          'Validar seguranca antes de uploads reais',
        ]}
      />
    </OperationalShell>
  );
}
