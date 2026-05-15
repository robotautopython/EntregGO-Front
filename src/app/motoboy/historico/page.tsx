'use client';

import { HistoricoMotoboy } from '@/components/motoboy/HistoricoMotoboy';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function MotoboyHistoricoPage() {
  return (
    <OperationalShell role="motoboy" title="Histórico">
      <HistoricoMotoboy />
    </OperationalShell>
  );
}
