import { ArrowRight, Clock3, History, Package, Wallet } from 'lucide-react';

import { BoxMark } from '@/components/brand/BoxMark';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

const features = [
  {
    icon: Package,
    title: '1 clique para solicitar',
    description: 'Endereço + observação. O resto é com a rede.',
  },
  {
    icon: Clock3,
    title: 'Timer de 60 segundos',
    description: 'Você vê a contagem e sabe na hora se foi aceito ou expirou.',
  },
  {
    icon: History,
    title: 'Histórico completo',
    description: 'Cada entrega registrada por dia, com motoboy e destino.',
  },
  {
    icon: Wallet,
    title: 'Relação direta com a central',
    description: 'Sem cobrança automática. Pagamento combinado fora do app.',
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
            <div className="relative mx-auto max-w-md rounded-2xl border border-paper-line bg-white p-8 shadow-card">
              <div className="flex items-center justify-center">
                <BoxMark size={180} />
              </div>
              <div className="mt-6 rounded-lg bg-paper-deep p-4">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-700">
                  recibo da loja
                </p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-asphalt-950/70">Pedido</span>
                    <span className="font-bold text-asphalt-950">#3421</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-asphalt-950/70">Destino</span>
                    <span className="font-bold text-asphalt-950">Av. Brasil, 884</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-asphalt-950/70">Status</span>
                    <span className="font-bold text-success-700">Entregue</span>
                  </div>
                </div>
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
              Sai do balcão sem perder o ritmo da operação.
            </h2>
            <p className="max-w-xl text-base leading-7 text-asphalt-950/75">
              A loja entra, cadastra, e o admin libera. Daí em diante, é um botão para chamar
              entrega — com timer claro, histórico e status até a porta do cliente.
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
