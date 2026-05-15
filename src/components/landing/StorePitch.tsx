import { ArrowRight, Bike, History, Package } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

// DESIGN AGENT: substituído o mockup (BoxMark + recibo) por uma foto real.
// Features simplificadas — removidos "Timer de 60 segundos" e "Relação direta
// com a central". Restam 3 benefícios concretos pro logista, sem jargão.
const features = [
  {
    icon: Package,
    title: 'Pedido em 1 toque',
    description: 'Você coloca o endereço, o pedido sai. Sem cadastro do cliente.',
  },
  {
    icon: Bike,
    title: 'Vários motoboys conectados',
    description: 'Sua loja chama a rede inteira de uma vez — quem estiver mais perto pega.',
  },
  {
    icon: History,
    title: 'Acompanhe cada entrega',
    description: 'Status atualizado na tela: aceito, coletou, em trânsito, entregue.',
  },
];

export function StorePitch() {
  return (
    <section
      id="para-lojas"
      className="relative overflow-hidden bg-paper py-20 sm:py-24"
      aria-labelledby="para-lojas-titulo"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-paper-line bg-white p-3 shadow-card">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-paper">
                <Image
                  alt="Atendente da loja preparando o pedido para o motoboy"
                  src="/landing/loja.webp"
                  fill
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 70vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <span
              aria-hidden="true"
              className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-brand-100 blur-2xl lg:block"
            />
          </div>

          <div className="order-1 space-y-7 lg:order-2">
            <SectionEyebrow tone="brand">Para lojas</SectionEyebrow>
            <h2
              id="para-lojas-titulo"
              className="text-3xl font-black leading-tight text-asphalt-950 sm:text-5xl"
            >
              Sua loja entrega sem complicação.
            </h2>
            <p className="max-w-xl text-base leading-7 text-asphalt-950/75">
              Cadastre sua loja, abra o pedido e pronto. A rede inteira recebe o aviso e quem
              estiver disponível pega a corrida.
            </p>

            <ul className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.title}
                    className="rounded-lg border border-paper-line bg-white p-5 shadow-card"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-extrabold text-asphalt-950">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-asphalt-950/70">
                      {feature.description}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="pt-2">
              <ButtonLink href="/registro?papel=loja" variant="primary" size="lg">
                Cadastrar minha loja
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
