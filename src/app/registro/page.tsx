import { Suspense } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegistroPage() {
  return (
    <AuthShell
      variant="register"
      eyebrow="Entrar na rede"
      title="Cadastre sua loja ou sua moto"
      subtitle="Você envia os dados, a central confere e libera o acesso. Sem mensalidade automática, sem leilão."
    >
      <Suspense
        fallback={
          <p className="text-sm text-asphalt-950/60">Carregando formulário...</p>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
