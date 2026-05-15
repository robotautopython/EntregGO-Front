import { Bell, Lock, ShieldCheck, Smartphone } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

const seals = [
  {
    icon: ShieldCheck,
    title: 'Cadastro com aprovação',
    description: 'Toda loja e motoboy passa pelos olhos da central antes de operar.',
    accent: 'from-brand-500 to-brand-700',
  },
  {
    icon: Lock,
    title: 'Dados protegidos pela API',
    description: 'O front nunca conversa direto com o banco. Tudo via backend com RLS.',
    accent: 'from-route-500 to-route-700',
  },
  {
    icon: Bell,
    title: 'Web Push planejado',
    description: 'Som, vibração e VAPID entram só após backend, service worker e Security Validator.',
    accent: 'from-signal-500 to-warn-700',
  },
  {
    icon: Smartphone,
    title: 'Base PWA preparada',
    description: 'Manifest já existe; experiência offline e push real ficam para ciclo próprio.',
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
            Confiança operacional
          </SectionEyebrow>
          <h2
            id="confianca-titulo"
            className="mx-auto mt-3 max-w-3xl text-3xl font-black text-asphalt-950 sm:text-4xl"
          >
            Quatro decisões que mantêm a central de pé.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-asphalt-950/70">
            Não é atalho de marketing — é o mapa do que já opera e do que só entra depois
            dos validadores certos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seals.map((seal) => {
            const Icon = seal.icon;
            return (
              <div
                key={seal.title}
                className="group relative overflow-hidden rounded-lg border border-paper-line bg-paper p-5 transition-all duration-ride ease-ride hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
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
