'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPagamentosPage() {
  return (
    <OperationalShell role="admin" title="Pagamentos">
      <ComingSoonPanel
        eyebrow="Operação"
        title="Controle de pagamentos"
        description="Tabela com status, vencimento e ação 'Marcar como pago'. Schema já existe (M-01 criou public.payments), mas controllers no backend ainda não."
        checkpoints={[
          'Endpoints GET /api/admin/payments e PATCH /api/admin/payments/:id/mark-paid não existem ainda',
          'Marcar como pago exige auditoria de quem marcou (Security Validator)',
          'Listagem precisa de paginação e índices revisados (Performance Validator)',
        ]}
      />
    </OperationalShell>
  );
}
