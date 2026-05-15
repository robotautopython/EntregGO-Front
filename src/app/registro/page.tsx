import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegistroPage() {
  return (
    <AuthShell
      title="Cadastro EntregGO"
      subtitle="Lojas e motoboys entram pela API backend e aguardam aprovacao operacional."
    >
      <RegisterForm />
    </AuthShell>
  );
}
