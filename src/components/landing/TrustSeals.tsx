import { ShieldCheck, Smartphone, UserCheck } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

// DESIGN AGENT: trust seals reduzidos a 3, com linguagem voltada ao usuário.
// Removidos RLS, signed URLs, Web Push, VAPID e referências a validadores.
const seals = [
  {
    icon: UserCheck,
    title: 'Cadastro com aprovação',
    description: 'Cada loja e cada motoboy passa por uma conferência antes de operar.',
    accent: 'from-brand-500 to-brand-700',
  },
  {
    icon: Smartphone,
    title: 'Funciona no celular',
    description: 'Abra direto no navegador — sem precisar baixar nada na loja de apps.',
    accent: 'from-route-500 to-route-700',
  },
  {
    icon: ShieldCheck,
    title: 'Sem instalação',
    description: 'É só criar conta, entrar e usar. Toda a operação roda direto pelo site.',
    accent: 'from-success-500 to-success-700',
  },
];

export function TrustSeals() {
  return (
    <section className="relative bg-white py-20 sm:py-24" aria-labelledby="confianca-titulo">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-paper-line to-transparent"
      />
      <Container>
        <div className="mb-12 text-center">
          <SectionEyebrow tone="brand" className="mx-auto inline-block">
            Por que EntregGO
          </SectionEyebrow>
          <h2
            id="confianca-titulo"
            className="mx-auto mt-3 max-w-3xl text-3xl font-black text-asphalt-950 sm:text-4xl"
          >
            Simples de começar, simples de usar.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {seals.map((seal) => {
            const Icon = seal.icon;
            return (
              <div
                key={seal.title}
                className="group relative overflow-hidden rounded-lg border border-paper-line bg-paper p-6 transition-all duration-ride ease-ride hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -top-1 left-0 h-1 w-full bg-gradient-to-r ${seal.accent} opacity-0 transition-opacity duration-ride ease-ride group-hover:opacity-100`}
                />
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br ${seal.accent} text-white shadow-card`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-asphalt-950">
                  {seal.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-asphalt-950/70">
                  {seal.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
