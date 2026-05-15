import { Bike, Store } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

// DESIGN AGENT: reduzido para 2 papéis (Loja → Motoboy). O passo "Admin
// governa" saiu — quem entra na landing é loja ou motoboy. Texto simplificado
// sem mencionar timer, push, aceite concorrente ou backend.
const steps = [
  {
    icon: Store,
    title: 'A loja chama',
    description:
      'Você abre o pedido na sua loja com endereço e observação. Em segundos, o pedido sai pra rede.',
    accent: 'brand' as const,
  },
  {
    icon: Bike,
    title: 'O motoboy aceita e entrega',
    description:
      'Um motoboy próximo recebe o aviso, aceita e segue até o cliente. Você acompanha o status até o fim.',
    accent: 'route' as const,
  },
];

const accentMap = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-200',
  route: 'bg-route-50 text-route-600 ring-route-200',
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
            <SectionEyebrow tone="route">Como funciona</SectionEyebrow>
            <h2
              id="rota-do-sistema"
              className="max-w-3xl text-3xl font-black text-asphalt-950 sm:text-5xl"
            >
              Dois passos. Sem complicação.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-asphalt-950/70">
            A EntregGO existe pra ser direta: a loja pede, o motoboy entrega. Você acompanha
            o caminho na tela.
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
              x1="200"
              y1="6"
              x2="1000"
              y2="6"
              stroke="#ff5a0a"
              strokeWidth="3"
              strokeDasharray="8 8"
              className="dashed-route"
            />
          </svg>

          <div className="relative grid gap-6 lg:grid-cols-2">
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
