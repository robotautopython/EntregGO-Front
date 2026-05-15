import { redirect } from 'next/navigation';

// `/admin` é mantido apenas como redirect para a rota canônica de cadastros.
// Removido do menu lateral em 2026-05-15: a antiga aba "Dashboard" duplicava
// `/admin/usuarios` (mesmo conteúdo, sem filtro). Preserva bookmarks e o
// destino atual do login.
export default function AdminIndexPage() {
  redirect('/admin/usuarios');
}
