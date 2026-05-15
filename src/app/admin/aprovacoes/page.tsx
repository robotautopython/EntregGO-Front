import { redirect } from 'next/navigation';

// `/admin/aprovacoes` é mantido apenas como redirect para a rota de usuários
// já filtrada por status=pendente. Removido do menu lateral em 2026-05-15:
// a antiga aba "Aprovações" duplicava `/admin/usuarios` com filtro fixo.
// O chip pulsante de pendentes dentro do painel cobre a chamada de atenção.
export default function AdminAprovacoesPage() {
  redirect('/admin/usuarios?status=pendente');
}
