import { ArrowRight, Bell, Bike, CheckCircle2, Power } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

const benefits = [
  'Fica online quando quiser, sem turno obrigatório',
  'Tela preparada para notificações futuras',
  'Aceite em um toque demonstrado sem disputa real ainda',
  'Cadastro inicial; documentos entram só com pipeline validado',
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
              <span className="text-brand-400">a central mostra como vai te chamar.</span>
            </h2>
            <p className="max-w-xl text-base leading-7 text-white/75">
              Você decide quando aparecer. Nesta fase, o painel demonstra a experiência de
              solicitação e aceite; push real e concorrência entram depois do backend validado.
            </p>

            <ul className="grid gap-3">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold backdrop-blur"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-brand-400"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
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
            <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-asphalt-900 p-5 shadow-ink">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white">
                    <Bike className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-white/60">Você</p>
                    <p className="text-base font-extrabold">João, 2.500m</p>
                  </div>
                </div>
                <Badge tone="success" pulsing className="border-white/10 bg-success-500/15 text-success-50">
                  online
                </Badge>
              </div>

              <button
                type="button"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-4 text-base font-extrabold shadow-pop transition-all hover:bg-brand-600"
              >
                <Power className="h-5 w-5" aria-hidden="true" />
                Online · Prévia de corridas
              </button>

              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                    Solicitação demo
                  </span>
                  <span className="text-white/60">há 4s</span>
                </div>
                <p className="mt-2 text-base font-extrabold">Açaí da Esquina</p>
                <p className="text-sm text-white/70">→ Av. Brasil, 884 — Apto 51</p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    className="col-span-2 rounded-md border border-white/15 px-3 py-3 text-sm font-bold text-white/80 hover:bg-white/5"
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
                    className="col-span-3 rounded-md bg-brand-500 px-3 py-3 text-sm font-extrabold text-white shadow-pop hover:bg-brand-600"
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
