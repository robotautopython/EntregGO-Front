'use client';

import { Suspense } from 'react';

import { CourierHomeFlow } from '@/components/motoboy/CourierHomeFlow';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function MotoboyPage() {
  return (
    <OperationalShell role="motoboy" title="Corridas">
      {({ authContext, accessToken }) => (
        <Suspense
          fallback={
            <p className="text-sm text-asphalt-950/60">Carregando central...</p>
          }
        >
          <CourierHomeFlow authContext={authContext} accessToken={accessToken} />
        </Suspense>
      )}
    </OperationalShell>
  );
}
