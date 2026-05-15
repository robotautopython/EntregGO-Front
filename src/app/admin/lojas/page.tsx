'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminLojasPage() {
  return (
    <OperationalShell role="admin" title="Lojas">
      <ComingSoonPanel
        eyebrow="Cadastros"
        title="Lojas"
        description="Visao operacional das lojas cadastradas, status e dados de perfil."
        checkpoints={[
          'Listar lojas por API backend',
          'Evitar acesso direto ao banco pelo frontend',
          'Exibir apenas dados necessarios para operacao',
        ]}
      />
    </OperationalShell>
  );
}
