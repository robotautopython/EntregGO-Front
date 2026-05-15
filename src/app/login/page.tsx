import { Suspense } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthShell
      variant="login"
      eyebrow="Bem-vindo de volta"
      title="Entrar na central"
      subtitle="Acesse seu painel — admin, loja ou motoboy. A central reconhece o seu perfil pela sessão."
    >
      <Suspense
        fallback={
          <p className="text-sm text-asphalt-950/60">Carregando formulário...</p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
