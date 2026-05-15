'use client';

import { Bike, Check, Clock3, MapPin, Package, Sparkles, Truck } from 'lucide-react';

import { RouteLine } from '@/components/brand/RouteLine';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

import type { AcceptedDelivery } from './delivery-types';

interface AcceptedStateProps {
  delivery: AcceptedDelivery;
  onNewRequest: () => void;
}

const timeline = [
  { key: 'aceito', label: 'Aceito', icon: Check, hint: 'Prévia: motoboy a caminho da loja' },
  { key: 'coletou', label: 'Coletou', icon: Package, hint: 'Prévia: saiu com o pacote' },
  { key: 'em_transito', label: 'Em trânsito', icon: Truck, hint: 'Prévia: a caminho do destino' },
  { key: 'entregue', label: 'Entregue', icon: Sparkles, hint: 'Prévia: cliente recebeu' },
] as const;

const order: AcceptedDelivery['status'][] = ['aceito', 'coletou', 'em_transito', 'entregue'];

export function AcceptedState({ delivery, onNewRequest }: AcceptedStateProps) {
  const currentIndex = order.indexOf(delivery.status);

  return (
    <section
      className="space-y-5 animate-fade-in"
      aria-live="polite"
    >
      <Card variant="white" className="relative overflow-hidden border-success-500/30 bg-success-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-success-500 text-white shadow-pop">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <Badge tone="success" pulsing>
                demo aceita
              </Badge>
              <h2 className="mt-2 text-2xl font-black text-asphalt-950">
                Exemplo de aceite por {delivery.courier.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-asphalt-950/70">
                {delivery.courier.distanceLabel ?? 'A caminho da sua loja'} ·{' '}
                {delivery.courier.bikePlate ?? 'moto cadastrada'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="md" onClick={onNewRequest}>
            Nova entrega
          </Button>
        </div>
      </Card>

      <Card variant="white">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-asphalt-950 text-xl font-extrabold text-white">
            {delivery.courier.initials}
          </span>
          <div className="flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Motoboy
            </p>
            <p className="text-lg font-black text-asphalt-950">{delivery.courier.name}</p>
          </div>
          <Bike className="h-6 w-6 text-asphalt-950/45" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-md border border-paper-line bg-paper p-4">
          <RouteLine from={delivery.route.from} to={delivery.route.to} />
        </div>

        {delivery.route.notes ? (
          <p className="mt-4 rounded-md border border-dashed border-paper-line p-3 text-sm text-asphalt-950/75">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Observação
            </span>
            <span className="mt-1 block">{delivery.route.notes}</span>
          </p>
        ) : null}

        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-asphalt-950/60">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Atualização demonstrativa
        </p>
      </Card>

      <Card variant="white">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
          Status da corrida
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {timeline.map((step, index) => {
            const Icon = step.icon;
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <li
                key={step.key}
                className={cn(
                  'relative rounded-md border p-4 transition-all duration-ride ease-ride',
                  isDone && 'border-success-500/30 bg-success-50 text-success-700',
                  isCurrent && 'border-brand-300 bg-brand-50 text-brand-700 shadow-card',
                  !isDone && !isCurrent && 'border-paper-line bg-paper text-asphalt-950/55',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md',
                      isDone && 'bg-success-500 text-white',
                      isCurrent && 'bg-brand-500 text-white animate-pulse-soft',
                      !isDone && !isCurrent && 'bg-white text-asphalt-950/45 border border-paper-line',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest opacity-70">
                    Passo {index + 1}
                  </span>
                </div>
                <p className="mt-3 text-base font-extrabold leading-tight">{step.label}</p>
                <p className="mt-0.5 text-xs opacity-75">{step.hint}</p>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card variant="paper">
        <div className="flex items-start gap-3 text-sm text-asphalt-950/75">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-route-600" aria-hidden="true" />
          <p>
            O EntregGO não tem rastreamento ao vivo — o status muda conforme o motoboy atualiza
            na rua. Esta prévia só mostra como a linha do tempo ficará quando o backend existir.
          </p>
        </div>
      </Card>
    </section>
  );
}
