import { ArrowRight, Bell, Bike, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

// DESIGN AGENT: substituído o mockup do painel motoboy por uma foto real.
// Removidas as menções a "primeiro toque vence", "primeiro aceite ganha",
// "disputa concorrente" e "backend validado". 3 benefícios diretos pro motoboy.
const benefits = [
  {
    icon: Bell,
    title: 'Avisos no seu celular',
    description: 'Quando uma loja chamar, você recebe o aviso na hora.',
  },
  {
    icon: Bike,
    title: 'Você decide quando aparecer',
    description: 'Fica online quando quiser. Sem turno, sem hora marcada.',
  },
  {
    icon: CheckCircle2,
    title: 'Aceite e siga',
    description: 'Toque em aceitar, vai até a loja, entrega e marca como concluída.',
  },
];

export function CourierPitch() {
  return (
    <section
      id="para-motoboys"
      className="relative overflow-hidden bg-asphalt-950 py-20 text-white sm:py-24"
      aria-labelledby="para-motoboys-titulo"
    >
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-2/3 bg-orange-radial opacity-60"
      />
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <SectionEyebrow tone="brand">Para motoboys</SectionEyebrow>
            <h2
              id="para-motoboys-titulo"
              className="text-3xl font-black leading-tight sm:text-5xl"
            >
              Sua moto, suas regras —{' '}
              <span className="text-brand-400">corridas perto de você.</span>
            </h2>
            <p className="max-w-xl text-base leading-7 text-white/75">
              A EntregGO avisa quando aparecer uma entrega na sua região. Você aceita, pega
              o pedido na loja e segue até o cliente.
            </p>

            <ul className="grid gap-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li
                    key={benefit.title}
                    className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-500/20 text-brand-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold text-white">{benefit.title}</p>
                      <p className="mt-0.5 text-sm font-medium text-white/70">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="pt-2">
              <ButtonLink href="/registro?papel=motoboy" variant="primary" size="xl">
                Quero ser motoboy
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-2xl bg-brand-500/20 blur-3xl"
            />
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-asphalt-900 p-3 shadow-ink">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-asphalt-800">
                <Image
                  alt="Motoboy EntregGO pronto para sair com o pedido"
                  src="/landing/motoboy.webp"
                  fill
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 70vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
