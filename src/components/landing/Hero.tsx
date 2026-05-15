import { ArrowRight, CheckCircle2, Clock3, Zap } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { HeroMockup } from './HeroMockup';

const trustPoints = [
  'Aprovação manual',
  'Sem mensalidade automática',
  'PWA pra celular',
];

const heroStats = [
  { value: '60s', label: 'Timer fixo de aceite' },
  { value: '1 toque', label: 'Primeiro aceite vence' },
  { value: '0 leilão', label: 'Sem disputa de preço' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper pt-28 sm:pt-32">
      <Image
        alt=""
        aria-hidden="true"
        src="/brand/entreggo-logo-transparent.png"
        width={1731}
        height={908}
        priority
        className="pointer-events-none absolute left-1/2 top-24 -z-0 hidden w-[1200px] max-w-none -translate-x-1/2 select-none opacity-[0.04] lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-0 bg-grid-paper opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-20 -z-0 hidden h-96 w-96 rounded-full bg-brand-500/15 blur-3xl lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-72 -z-0 hidden h-96 w-96 rounded-full bg-route-500/15 blur-3xl lg:block"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-12">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-md border border-route-200 bg-white/90 px-3 py-2 text-sm font-bold text-route-700 shadow-card backdrop-blur">
              <span
                aria-hidden="true"
                className="relative flex h-2 w-2"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Central de entregas sob demanda
            </span>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-asphalt-950 sm:text-6xl lg:text-7xl">
              Pedido sai. <br />
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Motoboy assume.
              </span>{' '}
              <br />
              Cliente recebe.
            </h1>

            <p className="max-w-xl text-lg leading-8 text-asphalt-950/75">
              A EntregGO conecta sua loja a uma rede de motoboys verificados. Você solicita,
              a central avisa quem está online, e o primeiro toque ganha a corrida.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registro?papel=loja" variant="primary" size="xl">
                Cadastrar minha loja
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/registro?papel=motoboy" variant="outline" size="xl">
                <Zap className="h-5 w-5" aria-hidden="true" />
                Sou motoboy
              </ButtonLink>
            </div>

            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm font-semibold text-asphalt-950/80">
              {trustPoints.map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <HeroMockup />
          </div>
        </div>

        <div className="relative -mb-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-paper-line bg-paper-line/60 shadow-card sm:gap-0 sm:divide-x sm:divide-paper-line">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white px-4 py-5 text-center sm:px-6 sm:py-6 sm:text-left"
            >
              <p className="text-2xl font-black text-asphalt-950 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-asphalt-950/60 sm:text-sm sm:normal-case sm:tracking-normal">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
