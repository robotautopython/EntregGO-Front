'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminInsightsPage() {
  return (
    <OperationalShell role="admin" title="Insights">
      <ComingSoonPanel
        eyebrow="Analise"
        title="Insights"
        description="Metricas de operacao entram depois que os fluxos reais estiverem persistindo dados."
        checkpoints={[
          'Definir metricas antes dos graficos',
          'Garantir paginacao e limites de payload',
          'Evitar dashboard fake antes dos dados reais',
        ]}
      />
    </OperationalShell>
  );
}
