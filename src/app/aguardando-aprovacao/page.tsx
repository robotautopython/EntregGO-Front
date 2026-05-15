import { Suspense } from 'react';

import { ApprovalStatus } from '@/components/auth/ApprovalStatus';
import { AuthShell } from '@/components/auth/AuthShell';

export default function AguardandoAprovacaoPage() {
  return (
    <AuthShell
      variant="status"
      eyebrow="Status do seu acesso"
      title="Aprovação da central"
      subtitle="Aqui você vê em que etapa está seu cadastro. Quando a central liberar, esta página muda sozinha."
    >
      <Suspense
        fallback={
          <p className="text-sm text-asphalt-950/60">Carregando status...</p>
        }
      >
        <ApprovalStatus />
      </Suspense>
    </AuthShell>
  );
}
