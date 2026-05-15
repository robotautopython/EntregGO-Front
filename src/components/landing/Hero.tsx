import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { HeroMockup } from './HeroMockup';

// DESIGN AGENT: hero simplificado — uma frase forte, uma subfrase clara,
// dois CTAs. Sem trust points técnicos (PWA, mensalidade), sem stats que
// mencionam timer, leilão ou aceite concorrente. Marca-d'agua reforçada
// (opacidade 0.04 → 0.07, largura 1200 → 1320) para presença da logo.
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
        className="pointer-events-none absolute left-1/2 top-24 -z-0 hidden w-[1320px] max-w-none -translate-x-1/2 select-none opacity-[0.07] lg:block"
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
        <div className="grid items-center gap-12 pb-20 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-12">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-md border border-route-200 bg-white/90 px-3 py-2 text-sm font-bold text-route-700 shadow-card backdrop-blur">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              EntregGO para sua cidade
            </span>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-asphalt-950 sm:text-6xl lg:text-7xl">
              Pedidos saindo da sua loja{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                em minutos.
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-asphalt-950/75">
              A EntregGO conecta sua loja a motoboys da região. Você pede, ele aceita,
              o cliente recebe. Simples assim.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registro?papel=loja" variant="primary" size="xl">
                Cadastrar minha loja
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/registro?papel=motoboy" variant="outline" size="xl">
                <Zap className="h-5 w-5" aria-hidden="true" />
                Quero ser motoboy
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <HeroMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
