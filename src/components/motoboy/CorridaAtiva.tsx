'use client';

import {
  AlertTriangle,
  Check,
  ChevronRight,
  ExternalLink,
  MapPin,
  Package,
  PhoneIncoming,
  Sparkles,
  Truck,
} from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

import {
  type ActiveRide,
  type RideStatus,
  buildMapsUrl,
  rideStatusOrder,
} from './courier-types';

interface CorridaAtivaProps {
  ride: ActiveRide;
  onAdvance: (next: RideStatus) => void;
  onFinish: () => void;
}

interface StepDef {
  status: RideStatus;
  label: string;
  helper: string;
  cta: string;
  icon: typeof Check;
}

const steps: StepDef[] = [
  {
    status: 'aceito',
    label: 'Aceito',
    helper: 'Indo até a loja',
    cta: 'Cheguei na loja',
    icon: Check,
  },
  {
    status: 'coletou',
    label: 'Coletou',
    helper: 'Pacote na mão',
    cta: 'Estou em trânsito',
    icon: Package,
  },
  {
    status: 'em_transito',
    label: 'Em trânsito',
    helper: 'A caminho do destino',
    cta: 'Entreguei',
    icon: Truck,
  },
  {
    status: 'entregue',
    label: 'Entregue',
    helper: 'Cliente recebeu',
    cta: 'Concluir e voltar pra fila',
    icon: Sparkles,
  },
];

function getNextStatus(current: RideStatus): RideStatus | null {
  const index = rideStatusOrder.indexOf(current);
  if (index < 0 || index >= rideStatusOrder.length - 1) return null;
  return rideStatusOrder[index + 1] ?? null;
}

export function CorridaAtiva({ ride, onAdvance, onFinish }: CorridaAtivaProps) {
  const currentIndex = rideStatusOrder.indexOf(ride.status);
  const next = getNextStatus(ride.status);

  return (
    <section className="space-y-5 animate-fade-in">
      <Card variant="white" className="border-brand-200 bg-brand-50">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-brand-500 text-white shadow-pop">
            <PhoneIncoming className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <Badge tone="brand" pulsing>
              Corrida demo em andamento
            </Badge>
            <h2 className="mt-2 text-2xl font-black text-asphalt-950 sm:text-3xl">
              {ride.store.name}
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-asphalt-950/70">
              {ride.store.distanceLabel} · iniciada agora
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AddressCard
          label="Coleta"
          tone="route"
          title={ride.store.name}
          address={ride.store.address}
        />
        <AddressCard
          label="Destino"
          tone="brand"
          title="Cliente"
          address={ride.destination}
        />
      </div>

      {ride.notes ? (
        <Card variant="paper" className="border-dashed">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Observação da loja
          </p>
          <p className="mt-1 text-base font-bold text-asphalt-950">{ride.notes}</p>
        </Card>
      ) : null}

      <Card variant="white">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
          Atualizar status
        </p>
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isNext = step.status === next;

            return (
              <li
                key={step.status}
                className={cn(
                  'relative flex items-center gap-3 rounded-md border px-3 py-3 sm:px-4',
                  isDone && 'border-success-500/30 bg-success-50',
                  isCurrent && 'border-brand-300 bg-brand-50',
                  !isDone && !isCurrent && 'border-paper-line bg-paper',
                )}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white',
                    isDone && 'bg-success-500',
                    isCurrent && 'bg-brand-500 animate-pulse-soft',
                    !isDone && !isCurrent && 'bg-white text-asphalt-950/45 border border-paper-line',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-base font-extrabold leading-tight',
                      isDone && 'text-success-700',
                      isCurrent && 'text-brand-700',
                      !isDone && !isCurrent && 'text-asphalt-950/65',
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-xs font-semibold',
                      isDone ? 'text-success-700/80' : isCurrent ? 'text-brand-700/85' : 'text-asphalt-950/55',
                    )}
                  >
                    {step.helper}
                  </p>
                </div>

                {isCurrent && next ? (
                  <button
                    type="button"
                    onClick={() => onAdvance(next)}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-asphalt-950 px-4 text-sm font-extrabold text-white shadow-ink transition-all duration-ui ease-ride hover:bg-asphalt-700 active:translate-y-px sm:min-w-44"
                  >
                    {step.cta}
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}

                {isCurrent && !next ? (
                  <button
                    type="button"
                    onClick={onFinish}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-success-500 px-4 text-sm font-extrabold text-white shadow-pop transition-all duration-ui ease-ride hover:bg-success-700 active:translate-y-px sm:min-w-44"
                  >
                    Concluir
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}

                {isNext && !isCurrent ? (
                  <span className="hidden text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55 sm:block">
                    Próximo
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Card>

      <Alert tone="warn" title="Algum problema na rua?">
        <p className="leading-6">
          Na versão real, este aviso será enviado para a central. Nesta prévia, o botão só
          representa o ponto de contato futuro.
        </p>
        <button
          type="button"
          disabled
          className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-warn-500/40 bg-white px-4 text-sm font-extrabold text-warn-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Aviso em breve
        </button>
      </Alert>
    </section>
  );
}

interface AddressCardProps {
  label: string;
  tone: 'brand' | 'route';
  title: string;
  address: string;
}

function AddressCard({ label, tone, title, address }: AddressCardProps) {
  const palette =
    tone === 'brand'
      ? { dot: 'bg-brand-500', ring: 'ring-brand-200', accent: 'text-brand-700' }
      : { dot: 'bg-route-500', ring: 'ring-route-200', accent: 'text-route-700' };

  return (
    <Card variant="white" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className={cn('flex h-3 w-3 rounded-full ring-4', palette.dot, palette.ring)}
          aria-hidden="true"
        />
        <p
          className={cn(
            'text-[10px] font-extrabold uppercase tracking-widest',
            palette.accent,
          )}
        >
          {label}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-asphalt-950/55">
          {title}
        </p>
        <p className="mt-1 text-base font-extrabold text-asphalt-950">{address}</p>
      </div>
      <a
        href={buildMapsUrl(address)}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-paper-line bg-paper px-4 text-sm font-extrabold text-asphalt-950 transition-colors hover:border-brand-300 hover:bg-paper-deep"
      >
        <MapPin className="h-4 w-4" aria-hidden="true" />
        Abrir no mapa
        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      </a>
    </Card>
  );
}
