import { Bike, MapPin, Package } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { CountdownRing } from '@/components/brand/CountdownRing';
import { RouteLine } from '@/components/brand/RouteLine';

export function HeroMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-2xl bg-orange-radial opacity-90 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-2xl bg-route-radial opacity-80 blur-2xl"
      />

      <div className="relative rounded-2xl border border-paper-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Package className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-asphalt-950/60">
                Simulação de solicitação
              </p>
              <p className="text-base font-extrabold text-asphalt-950">Açaí da Esquina</p>
            </div>
          </div>
          <Badge tone="brand" pulsing>
            demo
          </Badge>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <CountdownRing
            durationSeconds={60}
            size={184}
            stroke={10}
            loop
            label="Procurando motoboy"
          />
          <p className="mt-4 text-center text-sm font-semibold text-asphalt-950/80">
            Procurando motoboy disponível...
          </p>
          <p className="mt-1 text-center text-xs text-asphalt-950/60">
            Prévia visual do envio para a rede.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-paper-line bg-paper p-4">
          <RouteLine from="Rua das Flores, 120" to="Av. Brasil, 884 — Apto 51" />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-asphalt-950/70">
          <span className="inline-flex items-center gap-1.5">
            <Bike className="h-4 w-4 text-route-600" aria-hidden="true" />
            Rede futura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
            Centro
          </span>
        </div>
      </div>

      <div className="absolute -right-3 -top-3 hidden rotate-3 rounded-md border border-paper-line bg-white px-3 py-2 shadow-card sm:block">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-success-500" aria-hidden="true" />
          <p className="text-xs font-bold text-asphalt-950">Prévia criada · agora</p>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 hidden -rotate-2 rounded-md border border-paper-line bg-asphalt-950 px-3 py-2 text-white shadow-ink sm:block">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-300">
          Aceite concorrente planejado
        </p>
        <p className="text-xs font-semibold">Sem leilão, sem espera longa.</p>
      </div>
    </div>
  );
}
