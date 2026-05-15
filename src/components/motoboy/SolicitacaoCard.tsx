'use client';

import { Bell, Check, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { RouteLine } from '@/components/brand/RouteLine';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

import type { IncomingRequest } from './courier-types';

interface SolicitacaoCardProps {
  request: IncomingRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function secondsAgo(arrivedAt: number, now: number): number {
  return Math.max(0, Math.floor((now - arrivedAt) / 1000));
}

export function SolicitacaoCard({ request, onAccept, onDecline }: SolicitacaoCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = secondsAgo(request.arrivedAt, now);
  const isUrgent = elapsed >= 45;
  const isWarning = elapsed >= 30 && elapsed < 45;

  return (
    <article
      className={cn(
        'animate-slide-in-left relative overflow-hidden rounded-lg border bg-white p-5 shadow-card transition-all duration-ride ease-ride sm:p-6',
        isUrgent ? 'border-danger-500/40' : isWarning ? 'border-warn-500/30' : 'border-paper-line',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1.5',
          isUrgent ? 'bg-danger-500' : isWarning ? 'bg-warn-500' : 'bg-brand-500',
        )}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-asphalt-950 text-base font-extrabold text-white">
            {request.store.initials}
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
              Solicitação demo
            </p>
            <p className="text-lg font-black leading-tight text-asphalt-950 sm:text-xl">
              {request.store.name}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-asphalt-950/65">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {request.store.distanceLabel} da sua localização
            </p>
          </div>
        </div>

        <Badge tone={isUrgent ? 'danger' : isWarning ? 'warn' : 'brand'} pulsing={!isUrgent}>
          <Bell className="mr-0.5 h-3 w-3" aria-hidden="true" />
          {elapsed}s
        </Badge>
      </header>

      <div className="mt-5 rounded-md border border-paper-line bg-paper p-4">
        <RouteLine from={request.store.address} to={request.destination} />
      </div>

      {request.notes ? (
        <p className="mt-4 rounded-md border border-dashed border-paper-line p-3 text-sm text-asphalt-950/75">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Observação da loja
          </span>
          <span className="mt-1 block">{request.notes}</span>
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => onDecline(request.id)}
          className="col-span-2 inline-flex h-14 items-center justify-center gap-2 rounded-md border border-paper-line bg-white text-base font-extrabold text-asphalt-950/75 transition-all duration-ui ease-ride hover:border-asphalt-950/40 hover:text-asphalt-950 active:translate-y-px"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          Recusar
        </button>
        <button
          type="button"
          onClick={() => onAccept(request.id)}
          className="col-span-3 inline-flex h-14 items-center justify-center gap-2 rounded-md bg-brand-500 text-base font-extrabold text-white shadow-pop transition-all duration-ui ease-ride hover:bg-brand-600 active:translate-y-px"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
          Aceitar
        </button>
      </div>
    </article>
  );
}
