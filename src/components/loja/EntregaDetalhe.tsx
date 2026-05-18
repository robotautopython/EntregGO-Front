'use client';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Route,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, getMyDelivery } from '@/lib/api';
import { cn } from '@/lib/cn';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';
import type { DeliveryRequestStatus, StoreDeliveryDetail } from '@/types/delivery';

interface EntregaDetalheProps {
  accessToken: string;
  deliveryId: string;
}

interface DetailError {
  kind: 'not_found' | 'recoverable';
  title: string;
  message: string;
}

const statusLabel: Record<DeliveryRequestStatus, string> = {
  aguardando: 'Aguardando',
  aceita: 'Aceita',
  coletada: 'Coletada',
  em_transito: 'Em trânsito',
  entregue: 'Entregue',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
};

const statusTone: Record<
  DeliveryRequestStatus,
  'success' | 'warn' | 'route' | 'brand' | 'danger' | 'paper'
> = {
  aguardando: 'warn',
  aceita: 'route',
  coletada: 'brand',
  em_transito: 'brand',
  entregue: 'success',
  expirada: 'danger',
  cancelada: 'paper',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const REALTIME_NOTICE_DISMISS_MS = 4000;

function formatDateTime(value: string | null): string {
  if (!value) return 'Pendente';
  return dateTimeFormatter.format(new Date(value));
}

function mapDetailError(error: unknown): DetailError {
  if (!(error instanceof ClientApiError)) {
    return {
      kind: 'recoverable',
      title: 'Não foi possível carregar a entrega',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'DELIVERY_NOT_FOUND':
      return {
        kind: 'not_found',
        title: 'Entrega não encontrada',
        message: 'Ela pode ter sido removida, ou não pertence à sua loja.',
      };
    case 'USER_PENDING':
      return {
        kind: 'recoverable',
        title: 'Cadastro aguardando aprovação',
        message: 'Seu cadastro ainda precisa ser aprovado para ver entregas.',
      };
    case 'USER_BLOCKED':
      return {
        kind: 'recoverable',
        title: 'Conta bloqueada',
        message: 'Sua conta está bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
    case 'STORE_PROFILE_REQUIRED':
      return {
        kind: 'recoverable',
        title: 'Permissão negada',
        message: 'Somente uma loja ativa pode abrir esta entrega.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        kind: 'recoverable',
        title: 'Sessão inválida',
        message: 'Entre novamente para acompanhar a entrega.',
      };
    case 'API_URL_MISSING':
      return {
        kind: 'recoverable',
        title: 'API não configurada',
        message: error.message,
      };
    default:
      return {
        kind: 'recoverable',
        title: 'Não foi possível carregar a entrega',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

function buildTimeline(delivery: StoreDeliveryDetail) {
  const steps = [
    {
      key: 'created',
      label: 'Solicitação criada',
      value: delivery.created_at,
      complete: true,
      current: delivery.status === 'aguardando',
    },
    {
      key: 'accepted',
      label: 'Aceita',
      value: delivery.accepted_at,
      complete: Boolean(delivery.accepted_at),
      current: delivery.status === 'aceita',
    },
    {
      key: 'collected',
      label: 'Coletada',
      value: delivery.collected_at,
      complete: Boolean(delivery.collected_at),
      current: delivery.status === 'coletada',
    },
    {
      key: 'in_transit',
      label: 'Em trânsito',
      value: delivery.in_transit_at,
      complete: Boolean(delivery.in_transit_at),
      current: delivery.status === 'em_transito',
    },
    {
      key: 'delivered',
      label: 'Entregue',
      value: delivery.delivered_at,
      complete: Boolean(delivery.delivered_at),
      current: delivery.status === 'entregue',
    },
  ];

  if (delivery.status === 'expirada' || delivery.status === 'cancelada') {
    steps.push({
      key: delivery.status,
      label: statusLabel[delivery.status],
      value: delivery.updated_at,
      complete: true,
      current: true,
    });
  }

  return steps;
}

export function EntregaDetalhe({ accessToken, deliveryId }: EntregaDetalheProps) {
  const loadRequestId = useRef(0);
  const loadInFlight = useRef(false);
  const queuedLoad = useRef(false);
  const realtimeRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [delivery, setDelivery] = useState<StoreDeliveryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<DetailError | null>(null);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  const load = useCallback(
    async function runLoad(mode: 'initial' | 'refresh' | 'realtime' = 'initial') {
      if (loadInFlight.current) {
        queuedLoad.current = true;
        return;
      }

      const requestId = loadRequestId.current + 1;
      loadRequestId.current = requestId;
      loadInFlight.current = true;
      if (mode === 'initial') {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await getMyDelivery(accessToken, deliveryId);
        if (requestId === loadRequestId.current) {
          setDelivery(data ?? null);
        }
      } catch (caught) {
        if (requestId === loadRequestId.current && mode !== 'realtime') {
          setDelivery(null);
          setError(mapDetailError(caught));
        }
      } finally {
        if (requestId === loadRequestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
        loadInFlight.current = false;
        if (queuedLoad.current) {
          queuedLoad.current = false;
          void runLoad('realtime');
        }
      }
    },
    [accessToken, deliveryId],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const showRealtimeNotice = useCallback(() => {
    setRealtimeNotice('A entrega foi atualizada.');
    if (realtimeNoticeTimer.current) {
      clearTimeout(realtimeNoticeTimer.current);
    }

    realtimeNoticeTimer.current = setTimeout(() => {
      realtimeNoticeTimer.current = null;
      setRealtimeNotice(null);
    }, REALTIME_NOTICE_DISMISS_MS);
  }, []);

  const scheduleRealtimeRefresh = useCallback(() => {
    showRealtimeNotice();

    if (realtimeRefreshTimer.current) {
      clearTimeout(realtimeRefreshTimer.current);
    }

    const debounceWithJitterMs = 400 + Math.floor(Math.random() * 150);
    realtimeRefreshTimer.current = setTimeout(() => {
      realtimeRefreshTimer.current = null;
      void load('realtime');
    }, debounceWithJitterMs);
  }, [load, showRealtimeNotice]);

  useEffect(() => {
    const unsubscribe = subscribeToStoreDeliveryBroadcast(
      accessToken,
      deliveryId,
      scheduleRealtimeRefresh,
    );

    return () => {
      if (realtimeRefreshTimer.current) {
        clearTimeout(realtimeRefreshTimer.current);
        realtimeRefreshTimer.current = null;
      }
      if (realtimeNoticeTimer.current) {
        clearTimeout(realtimeNoticeTimer.current);
        realtimeNoticeTimer.current = null;
      }
      unsubscribe();
    };
  }, [accessToken, deliveryId, scheduleRealtimeRefresh]);

  const timeline = useMemo(() => (delivery ? buildTimeline(delivery) : []), [delivery]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Acompanhamento"
        title={`Entrega #${deliveryId.slice(0, 8)}`}
        description="Status real da solicitação criada pela sua loja."
        actions={
          <ButtonLink href="/loja/historico" variant="secondary" size="md">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Histórico
          </ButtonLink>
        }
      />

      {isLoading ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Carregando entrega...</p>
          </div>
        </Card>
      ) : error?.kind === 'not_found' ? (
        <Card variant="white" className="text-center">
          <div className="flex flex-col items-center gap-4 py-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-paper text-asphalt-950/60">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-black text-asphalt-950">{error.title}</h2>
              <p className="mt-2 max-w-md text-sm font-medium text-asphalt-950/65">
                {error.message}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" size="md" onClick={() => void load('refresh')}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Atualizar
              </Button>
              <ButtonLink href="/loja/historico" variant="primary" size="md">
                Ver histórico
              </ButtonLink>
            </div>
          </div>
        </Card>
      ) : error ? (
        <Alert tone="danger" title={error.title}>
          {error.message}
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={isRefreshing}
              onClick={() => void load('refresh')}
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                aria-hidden="true"
              />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      ) : delivery ? (
        <section className="space-y-5" aria-live="polite">
          {realtimeNotice ? (
            <Alert tone="info" title="Atualizacao em tempo real">
              {realtimeNotice}
            </Alert>
          ) : null}

          <Card variant="white" className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <PackageCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                    Status atual
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-asphalt-950">
                      {statusLabel[delivery.status]}
                    </h2>
                    <Badge tone={statusTone[delivery.status]}>{statusLabel[delivery.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-asphalt-950/65">
                    Atualizada em {formatDateTime(delivery.updated_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="md"
                disabled={isRefreshing}
                onClick={() => void load('refresh')}
              >
                <RefreshCw
                  className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                  aria-hidden="true"
                />
                Atualizar
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DetailTile
                icon={MapPin}
                label="Destino"
                value={delivery.destination_address ?? 'Destino não informado'}
              />
              <DetailTile
                icon={Clock3}
                label="Criada em"
                value={formatDateTime(delivery.created_at)}
              />
              <DetailTile
                icon={Clock3}
                label="Expira em"
                value={formatDateTime(delivery.expires_at)}
              />
            </div>

            {delivery.notes ? (
              <div className="rounded-md border border-dashed border-paper-line bg-paper p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                  Observação
                </p>
                <p className="mt-1 text-sm font-medium text-asphalt-950/75">{delivery.notes}</p>
              </div>
            ) : null}
          </Card>

          <Card variant="white">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-route-600">
                  Linha do tempo
                </p>
                <h3 className="mt-1 text-lg font-black text-asphalt-950">Etapas da entrega</h3>
              </div>
              <Route className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
            </div>

            <ol className="space-y-3">
              {timeline.map((step) => (
                <li key={step.key} className="flex gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                      step.complete || step.current
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-paper-line bg-paper text-asphalt-950/35',
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-md border border-paper-line bg-paper px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-asphalt-950">{step.label}</p>
                      {step.current ? <Badge tone="route">Atual</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs font-bold text-asphalt-950/60">
                      {formatDateTime(step.value)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

interface DetailTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function DetailTile({ icon: Icon, label, value }: DetailTileProps) {
  return (
    <div className="rounded-md border border-paper-line bg-paper p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-black text-asphalt-950">{value}</p>
    </div>
  );
}
