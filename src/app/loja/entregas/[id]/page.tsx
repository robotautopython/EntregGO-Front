'use client';

import { useParams } from 'next/navigation';

import { EntregaDetalhe } from '@/components/loja/EntregaDetalhe';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function LojaEntregaDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const deliveryId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  return (
    <OperationalShell role="logista" title="Entrega">
      {({ accessToken }) => <EntregaDetalhe accessToken={accessToken} deliveryId={deliveryId} />}
    </OperationalShell>
  );
}
