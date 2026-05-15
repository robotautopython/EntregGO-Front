'use client';

import { Suspense } from 'react';

import { NovaEntregaFlow } from '@/components/loja/NovaEntregaFlow';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function NovaEntregaPage() {
  return (
    <OperationalShell role="logista" title="Nova entrega">
      {({ accessToken }) => (
        <Suspense
          fallback={
            <p className="text-sm text-asphalt-950/60">Preparando solicitação...</p>
          }
        >
          <NovaEntregaFlow accessToken={accessToken} />
        </Suspense>
      )}
    </OperationalShell>
  );
}
