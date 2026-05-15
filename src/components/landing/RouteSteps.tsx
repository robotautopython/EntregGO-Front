import { Bike, ShieldCheck, Store } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

const steps = [
  {
    icon: Store,
    title: 'Loja solicita',
    description:
      'Endereço e observação já têm fluxo visual. O envio real para motoboys fica para o backend de entregas.',
    accent: 'brand' as const,
  },
  {
    icon: Bike,
    title: 'Motoboy aceita',
    description:
      'A tela mostra a experiência planejada de aceite; push, realtime e disputa concorrente ainda não estão ativos.',
    accent: 'route' as const,
  },
  {
    icon: ShieldCheck,
    title: 'Admin governa',
    description:
      'Aprova cadastros, controla bloqueios e acompanha entregas. Antes da rua, a central.',
    accent: 'asphalt' as const,
  },
];

const accentMap = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-200',
  route: 'bg-route-50 text-route-600 ring-route-200',
  asphalt: 'bg-asphalt-950 text-white ring-asphalt-700',
};

export function RouteSteps() {
  return (
    <section
      id="como-funciona"
      className="relative bg-white py-20 sm:py-24"
      aria-labelledby="rota-do-sistema"
    >
      <Container>
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <SectionEyebrow tone="route">Rota do sistema</SectionEyebrow>
            <h2
              id="rota-do-sistema"
              className="max-w-3xl text-3xl font-black text-asphalt-950 sm:text-5xl"
            >
              Três papéis, um fluxo que cabe na palma da mão.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-asphalt-950/70">
            A base real cobre cadastro, aprovação e admin. Pedido, push e aceite concorrente
            ficam como fluxo demonstrativo até o backend próprio.
          </p>
        </div>

        <div className="relative">
          <svg
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 hidden h-3 w-full lg:block"
            viewBox="0 0 1200 12"
            preserveAspectRatio="none"
          >
            <line
              x1="100"
              y1="6"
              x2="1100"
              y2="6"
              stroke="#ff5a0a"
              strokeWidth="3"
              strokeDasharray="8 8"
              className="dashed-route"
            />
          </svg>

          <div className="relative grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="group relative rounded-lg border border-paper-line bg-paper p-7 shadow-card transition-all duration-ride ease-ride hover:-translate-y-1 hover:border-brand-200 hover:shadow-pop"
                >
                  <div className="mb-7 flex items-start justify-between">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-lg ring-4 ${accentMap[step.accent]}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-brand-500/80">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-asphalt-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-asphalt-950/70">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
