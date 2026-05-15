import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthShell
      title="Acesso EntregGO"
      subtitle="Entre com a sessao Supabase Auth e confirme seu perfil pela API."
    >
      <LoginForm />
    </AuthShell>
  );
}
