import { Suspense } from 'react';

import { ApprovalStatus } from '@/components/auth/ApprovalStatus';
import { AuthShell } from '@/components/auth/AuthShell';

export default function AguardandoAprovacaoPage() {
  return (
    <AuthShell
      title="Aprovacao de acesso"
      subtitle="O acesso operacional depende do status de dominio definido pelo admin."
    >
      <Suspense fallback={<div className="text-sm text-gray-600">Carregando status</div>}>
        <ApprovalStatus />
      </Suspense>
    </AuthShell>
  );
}
