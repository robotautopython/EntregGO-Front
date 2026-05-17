'use client';

import { ComingSoonPanel } from '@/components/shared/ComingSoonPanel';
import { OperationalShell } from '@/components/shell/OperationalShell';

export default function AdminPagamentosPage() {
  return (
    <OperationalShell role="admin" title="Pagamentos">
      <ComingSoonPanel
        eyebrow="Operação"
        title="Confirmação de pagamento externo"
        description="Controle simples para o admin marcar se logista ou motoboy pagou fora da plataforma. Não haverá checkout, gateway, PIX, cartão ou repasse dentro do EntregGO."
        checkpoints={[
          'Endpoints GET /api/admin/payments e PATCH /api/admin/payments/:id/mark-paid não existem ainda',
          'Marcar como pago exige auditoria simples de quem marcou e quando',
          'Listagem precisa de paginação e índices revisados (Performance Validator)',
        ]}
      />
    </OperationalShell>
  );
}
