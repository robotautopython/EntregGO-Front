'use client';

import { useParams } from 'next/navigation';

import { HistoricoMotoboyDetalhe } from '@/components/motoboy/HistoricoMotoboyDetalhe';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function MotoboyHistoricoDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const deliveryId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  return (
    <OperationalShell role="motoboy" title="Histórico">
      {({ accessToken }) => (
        <HistoricoMotoboyDetalhe accessToken={accessToken} deliveryId={deliveryId} />
      )}
    </OperationalShell>
  );
}
