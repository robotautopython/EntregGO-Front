'use client';

import { LojaInsightsPlaceholder } from '@/components/loja/LojaInsightsPlaceholder';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function LojaInsightsPage() {
  return (
    <OperationalShell role="logista" title="Insights">
      <LojaInsightsPlaceholder />
    </OperationalShell>
  );
}
