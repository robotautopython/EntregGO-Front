import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

// DESIGN AGENT: CTA único e direto. Removido o botão "Falar com a central" e a
// menção a "Pedido real e aceite entram depois, em ciclo validado". Foco em
// converter loja ou motoboy direto para o cadastro.
export function CTABand() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 py-20 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-brand-400 opacity-50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-12 h-[360px] w-[360px] rounded-full bg-route-500/40 blur-3xl"
      />
      <Image
        alt=""
        aria-hidden="true"
        src="/brand/entreggo-logo-on-dark.png"
        width={1731}
        height={908}
        className="pointer-events-none absolute -bottom-10 -left-16 hidden w-[560px] max-w-none select-none opacity-[0.12] sm:block"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white/95 ring-1 ring-white/20 backdrop-blur">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white" />
              Pronto pra acelerar
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Comece em poucos minutos.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
              Cadastre sua loja ou sua moto. Em seguida você já tem acesso ao painel pra
              começar a operar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <ButtonLink
              href="/registro"
              variant="dark"
              size="xl"
              className="w-full sm:w-auto"
            >
              Começar cadastro
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
