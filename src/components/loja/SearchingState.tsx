'use client';

import { Bell, X } from 'lucide-react';
import { useState } from 'react';

import { CountdownRing } from '@/components/brand/CountdownRing';
import { RouteLine } from '@/components/brand/RouteLine';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import type { DeliveryDraft } from './delivery-types';

interface SearchingStateProps {
  draft: DeliveryDraft;
  storeAddress: string;
  storeName: string;
  onExpire: () => void;
  onCancel: () => void;
}

function microcopyFor(remaining: number): string {
  if (remaining <= 5) return 'Últimos segundos da simulação...';
  if (remaining <= 15) return 'Quase lá, prévia terminando.';
  if (remaining <= 30) return 'Simulando busca por motoboys próximos.';
  return 'Simulando busca de motoboy disponível...';
}

export function SearchingState({
  draft,
  storeAddress,
  storeName,
  onExpire,
  onCancel,
}: SearchingStateProps) {
  const [remaining, setRemaining] = useState(60);

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-paper-line bg-white px-5 py-12 text-center shadow-card sm:px-8 sm:py-16"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100 opacity-50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-route-50 opacity-60 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-7">
        <Badge tone="brand" pulsing>
          demo
        </Badge>

        <h2 className="max-w-2xl text-2xl font-black leading-tight text-asphalt-950 sm:text-4xl">
          {microcopyFor(remaining)}
        </h2>

        <CountdownRing
          durationSeconds={60}
          size={260}
          stroke={14}
          onTick={setRemaining}
          onComplete={onExpire}
          label="Procurando motoboy"
        />

        <p className="max-w-md text-sm text-asphalt-950/65">
          Esta tela simula o envio para a rede. Notificação real, concorrência e aceite único entram
          depois do backend validado.
        </p>

        <div className="w-full max-w-xl rounded-lg border border-paper-line bg-paper p-5 text-left">
          <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            <Bell className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Resumo da simulação
          </div>
          <RouteLine
            from={`${storeName} — ${storeAddress}`}
            to={draft.destinationAddress ?? 'Destino não informado'}
          />
          {draft.notes ? (
            <p className="mt-4 rounded-md border border-paper-line bg-white p-3 text-sm text-asphalt-950/75">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                Observação
              </span>
              <span className="mt-1 block">{draft.notes}</span>
            </p>
          ) : null}
        </div>

        <Button variant="ghost" size="md" onClick={onCancel}>
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar simulação
        </Button>
      </div>
    </section>
  );
}
