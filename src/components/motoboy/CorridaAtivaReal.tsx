'use client';

import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  RefreshCw,
  Store,
} from 'lucide-react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ActiveDelivery, DeliveryTransitionStatus } from '@/types/delivery';

interface CorridaAtivaRealProps {
  delivery: ActiveDelivery;
  isRefreshing?: boolean;
  isUpdatingStatus?: boolean;
  onRefresh: () => void;
  onStatusChange: (status: DeliveryTransitionStatus) => void;
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function formatInstant(iso: string | null): string {
  if (!iso) return 'horario pendente';
  return timeFormatter.format(new Date(iso));
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const statusConfig = {
  aceita: {
    badge: 'Aceita',
    cardClass: 'border-success-500/30 bg-success-50',
    icon: PackageCheck,
    iconClass: 'bg-success-500',
    actionLabel: 'Confirmar coleta',
    actionStatus: 'coletada',
    actionIcon: PackageCheck,
    actionVariant: 'success',
  },
  coletada: {
    badge: 'Coletada',
    cardClass: 'border-route-500/30 bg-route-50',
    icon: PackageCheck,
    iconClass: 'bg-route-500',
    actionLabel: 'Iniciar transito',
    actionStatus: 'em_transito',
    actionIcon: Navigation,
    actionVariant: 'primary',
  },
  em_transito: {
    badge: 'Em transito',
    cardClass: 'border-brand-500/30 bg-brand-50',
    icon: Navigation,
    iconClass: 'bg-brand-500',
    actionLabel: 'Concluir entrega',
    actionStatus: 'entregue',
    actionIcon: CheckCircle2,
    actionVariant: 'dark',
  },
} as const;

export function CorridaAtivaReal({
  delivery,
  isRefreshing = false,
  isUpdatingStatus = false,
  onRefresh,
  onStatusChange,
}: CorridaAtivaRealProps) {
  const hasDestination = Boolean(delivery.destination_address?.trim());
  const config = statusConfig[delivery.status];
  const StatusIcon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <section className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Operacao"
        title="Corrida em andamento"
        description="Dados reais da entrega assumida pelo seu perfil."
      />

      <Card variant="white" className={config.cardClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white shadow-pop ${config.iconClass}`}
            >
              <StatusIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <Badge tone="success">{config.badge}</Badge>
              <h2 className="mt-2 text-2xl font-black text-asphalt-950">
                {delivery.store.name}
              </h2>
              <p className="mt-1 text-xs font-bold text-asphalt-950/55">
                Aceita em {formatInstant(delivery.accepted_at)} - criada em{' '}
                {formatInstant(delivery.created_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              variant={config.actionVariant}
              size="sm"
              onClick={() => onStatusChange(config.actionStatus)}
              disabled={isRefreshing || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ActionIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {config.actionLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || isUpdatingStatus}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Atualizar
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AddressCard
          icon={Store}
          label="Coleta"
          title={delivery.store.name}
          address={delivery.store.address}
        />
        <AddressCard
          icon={Navigation}
          label="Destino"
          title="Entrega"
          address={delivery.destination_address}
        />
      </div>

      {delivery.notes ? (
        <Card variant="paper" className="border-dashed">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Observacao da loja
          </p>
          <p className="mt-1 text-base font-bold text-asphalt-950">{delivery.notes}</p>
        </Card>
      ) : null}

      {!hasDestination ? (
        <Alert tone="info" title="Destino nao informado">
          A loja nao informou endereco de destino nesta solicitacao. Combine a proxima etapa com
          a central fora do app.
        </Alert>
      ) : null}
    </section>
  );
}

interface AddressCardProps {
  icon: typeof Store;
  label: string;
  title: string;
  address: string | null;
}

function AddressCard({ icon: Icon, label, title, address }: AddressCardProps) {
  return (
    <Card variant="white" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white shadow-pop">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-700">
            {label}
          </p>
          <p className="text-base font-extrabold text-asphalt-950">{title}</p>
        </div>
      </div>
      {address ? (
        <>
          <p className="text-sm font-semibold leading-6 text-asphalt-950/75">{address}</p>
          <a
            href={mapsUrl(address)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-paper-line bg-paper px-4 text-sm font-extrabold text-asphalt-950 transition-colors hover:border-brand-300 hover:bg-paper-deep"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Abrir no mapa
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          </a>
        </>
      ) : (
        <p className="text-sm font-semibold leading-6 text-asphalt-950/65">
          Endereco nao informado.
        </p>
      )}
    </Card>
  );
}
