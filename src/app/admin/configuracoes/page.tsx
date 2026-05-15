'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminConfiguracoesPage() {
  return (
    <OperationalShell role="admin" title="Configurações">
      <ComingSoonPanel
        eyebrow="Sistema"
        title="Configurações"
        description="Ajustes operacionais da central — política de aprovação, valores padrão, integrações — serão definidos em ciclo próprio."
        checkpoints={[
          'Nenhum secret no frontend (ADR-002)',
          'Separar configurações públicas de privadas',
          'Validar permissões antes de qualquer ação sensível',
        ]}
      />
    </OperationalShell>
  );
}
