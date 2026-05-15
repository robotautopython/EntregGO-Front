'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminConfiguracoesPage() {
  return (
    <OperationalShell role="admin" title="Configuracoes">
      <ComingSoonPanel
        eyebrow="Sistema"
        title="Configuracoes"
        description="Ajustes operacionais da central serao definidos em ciclo proprio."
        checkpoints={[
          'Nao expor secrets no frontend',
          'Separar configuracoes publicas de privadas',
          'Validar permissoes antes de qualquer acao sensivel',
        ]}
      />
    </OperationalShell>
  );
}
