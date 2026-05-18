'use client';

import {
  ArrowRight,
  Bike,
  Clock3,
  Eye,
  History,
  Loader2,
  MapPin,
  Package,
  PackagePlus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, listMyDeliveries } from '@/lib/api';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';
import type { AuthContext } from '@/types/auth';
import type {
  DeliveryRequestStatus,
  StoreDeliveryListItem,
  StoreDeliveryListResult,
} from '@/types/delivery';

interface LojaHomeProps {
  accessToken: string;
  authContext: AuthContext;
}

interface PanelError {
  title: string;
  message: string;
}

const PANEL_LIMIT = 6;
const OPEN_STATUSES = new Set<DeliveryRequestStatus>([
  'aguardando',
  'aceita',
  'coletada',
  'em_transito',
]);

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
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(value: string | null): string {
  if (!value) return 'Pendente';
  return dateTimeFormatter.format(new Date(value));
}

function mapPanelError(error: unknown): PanelError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Não foi possível carregar o painel',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovação',
        message: 'Seu cadastro ainda precisa ser aprovado para acompanhar entregas.',
      };
    case 'USER_BLOCKED':
      return {
        title: 'Conta bloqueada',
        message: 'Sua conta está bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
    case 'STORE_PROFILE_REQUIRED':
      return {
        title: 'Permissão negada',
        message: 'Somente uma loja ativa pode acompanhar este painel.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessão inválida',
        message: 'Entre novamente para acompanhar suas entregas.',
      };
    case 'API_URL_MISSING':
      return {
        title: 'Serviço indisponível',
        message: 'Não foi possível carregar o painel agora. Tente novamente mais tarde.',
      };
    default:
      return {
        title: 'Não foi possível carregar o painel',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

function isOpenDelivery(delivery: StoreDeliveryListItem): boolean {
  return OPEN_STATUSES.has(delivery.status);
}

function destinationLabel(delivery: StoreDeliveryListItem): string {
  return delivery.destination_address ?? 'Destino não informado';
}

export function LojaHome({ accessToken, authContext }: LojaHomeProps) {
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const loadInFlight = useRef(false);
  const queuedLoad = useRef(false);
  const isActive = useRef(true);
  const [result, setResult] = useState<StoreDeliveryListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<PanelError | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'manual' | 'realtime' = 'initial') => {
      if (loadInFlight.current) {
        queuedLoad.current = true;
        return;
      }

      const currentRequestId = requestId.current + 1;
      requestId.current = currentRequestId;
      loadInFlight.current = true;
      if (mode === 'initial') {
        setIsLoading(true);
      } else if (mode === 'manual') {
        setIsRefreshing(true);
      }
      if (mode !== 'realtime') {
        setError(null);
      }

      try {
        const data = await listMyDeliveries(accessToken, { page: 1, limit: PANEL_LIMIT });
        if (isActive.current && currentRequestId === requestId.current) {
          setResult(data ?? null);
          setError(null);
        }
      } catch (caught) {
        if (isActive.current && currentRequestId === requestId.current && mode !== 'realtime') {
          setError(mapPanelError(caught));
          setResult(null);
        }
      } finally {
        if (isActive.current && currentRequestId === requestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
        loadInFlight.current = false;
        if (isActive.current && queuedLoad.current) {
          queuedLoad.current = false;
          void load('realtime');
        }
      }
    },
    [accessToken],
  );

  useEffect(() => {
    isActive.current = true;
    void load('initial');

    return () => {
      isActive.current = false;
      queuedLoad.current = false;
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [load]);

  const items = useMemo(() => result?.items ?? [], [result]);
  const openDeliveries = useMemo(() => items.filter(isOpenDelivery), [items]);
  const recentDeliveries = useMemo(() => items.slice(0, 3), [items]);
  const trackedDeliveryIds = useMemo(
    () => openDeliveries.map((delivery) => delivery.id).join('|'),
    [openDeliveries],
  );

  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      void load('realtime');
    }, 350);
  }, [load]);

  useEffect(() => {
    if (!trackedDeliveryIds) return undefined;

    const unsubscribes = trackedDeliveryIds.split('|').map((deliveryId) =>
      subscribeToStoreDeliveryBroadcast(
        accessToken,
        deliveryId,
        scheduleRealtimeRefresh,
        undefined,
        () => {
          void load('realtime');
        },
      ),
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [accessToken, load, scheduleRealtimeRefresh, trackedDeliveryIds]);

  const kpis = [
    { label: 'Em andamento', value: openDeliveries.length, tone: 'route' as const },
    { label: 'Na lista', value: items.length, tone: 'brand' as const },
    { label: 'Total registrado', value: result?.pagination.total ?? 0, tone: 'paper' as const },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Olá, ${authContext.user.email.split('@')[0]}`}
        title="Sua central, em uma tela."
        description="Crie solicitações de entrega e acompanhe aceite, coleta, trajeto e conclusão."
        actions={
          <Button
            variant="secondary"
            size="md"
            disabled={isLoading || isRefreshing}
            onClick={() => void load('manual')}
          >
            <RefreshCw
              className={`h-4 w-4${isRefreshing ? ' animate-spin' : ''}`}
              aria-hidden="true"
            />
            Atualizar
          </Button>
        }
      />

      <Link
        href="/loja/nova-entrega"
        className="group relative block overflow-hidden rounded-lg bg-brand-500 p-6 text-white shadow-pop transition-transform duration-ride ease-ride hover:-translate-y-0.5 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-brand-600 opacity-60 blur-3xl transition-transform group-hover:scale-110"
        />
        <div aria-hidden="true" className="absolute -bottom-10 -right-10 opacity-25">
          <BoxMark size={220} tone="paper" />
        </div>
        <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Badge tone="signal" className="border-white/20 bg-white/15 text-white">
              Em 1 clique
            </Badge>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Solicitar nova entrega
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Informe o destino quando tiver e acompanhe o andamento pelo painel da loja.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-asphalt-950 px-5 py-3 text-sm font-extrabold shadow-ink transition-colors group-hover:bg-asphalt-700">
            Começar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      </Link>

      {error ? (
        <Alert tone="danger" title={error.title}>
          {error.message}
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="white">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              {kpi.label}
            </p>
            <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
              {isLoading ? '...' : kpi.value}
            </p>
            <Badge tone={kpi.tone} className="mt-2">
              atualizado
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card variant="white" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-route-600">
                Em andamento
              </p>
              <h3 className="text-lg font-black text-asphalt-950">
                {openDeliveries.length
                  ? `${openDeliveries.length} entrega${openDeliveries.length === 1 ? '' : 's'} aberta${openDeliveries.length === 1 ? '' : 's'}`
                  : 'Nenhuma entrega em andamento'}
              </h3>
            </div>
            <Package className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-paper-line bg-paper p-8 text-center text-asphalt-950/70">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
              <p className="text-sm font-bold">Carregando painel...</p>
            </div>
          ) : openDeliveries.length ? (
            <ul className="space-y-2">
              {openDeliveries.map((delivery) => (
                <li
                  key={delivery.id}
                  className="rounded-md border border-paper-line bg-paper p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        Destino
                      </p>
                      <p className="mt-1 break-words text-sm font-black text-asphalt-950">
                        {destinationLabel(delivery)}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-asphalt-950/60">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        Criada em {formatDateTime(delivery.created_at)}
                        {delivery.accepted_at
                          ? ` - aceita em ${formatDateTime(delivery.accepted_at)}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge tone={statusTone[delivery.status]}>{statusLabel[delivery.status]}</Badge>
                      <ButtonLink
                        href={`/loja/entregas/${delivery.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Abrir
                      </ButtonLink>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-paper-line bg-paper p-8 text-center">
              <BoxMark size={88} tone="paper" />
              <p className="text-sm font-bold text-asphalt-950">
                Nenhuma entrega em andamento agora.
              </p>
              <p className="max-w-xs text-xs text-asphalt-950/60">
                Quando uma solicitação for aceita ou movimentada, ela aparece aqui.
              </p>
            </div>
          )}
        </Card>

        <Card variant="white" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                Histórico recente
              </p>
              <h3 className="text-lg font-black text-asphalt-950">
                {recentDeliveries.length ? 'Últimas solicitações' : 'Sem entregas ainda'}
              </h3>
            </div>
            <History className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
          </div>

          {isLoading ? (
            <div className="rounded-md border border-dashed border-paper-line bg-paper p-6 text-sm font-bold text-asphalt-950/65">
              Carregando entregas...
            </div>
          ) : recentDeliveries.length ? (
            <ul className="space-y-2">
              {recentDeliveries.map((delivery) => (
                <li
                  key={delivery.id}
                  className="rounded-md border border-paper-line bg-paper p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-asphalt-950">
                        {destinationLabel(delivery)}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-asphalt-950/55">
                        <Bike className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDateTime(delivery.updated_at)}
                      </p>
                    </div>
                    <Badge tone={statusTone[delivery.status]}>{statusLabel[delivery.status]}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed border-paper-line bg-paper p-6 text-sm text-asphalt-950/65">
              Suas solicitações recentes aparecem aqui assim que forem criadas.
            </div>
          )}

          <Link
            href="/loja/historico"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 hover:underline"
          >
            Ver tudo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <Card variant="paper" className="border-dashed">
        <div className="flex items-start gap-4">
          <TrendingUp className="mt-1 h-5 w-5 text-route-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-asphalt-950">Resumo operacional</p>
            <p className="text-xs text-asphalt-950/65">
              Use esta central para acompanhar as entregas abertas e abrir o detalhe quando
              precisar ver destino, observação, horário de aceite e etapas.
            </p>
            <Link
              href="/loja/insights"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-extrabold text-route-700 hover:underline"
            >
              Abrir insights
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Card>

      <Card variant="white" className="border-brand-200 bg-brand-50">
        <div className="flex items-start gap-3">
          <PackagePlus className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div className="text-sm text-brand-700">
            <p className="font-extrabold">Acompanhamento ativo</p>
            <p className="mt-1 leading-6 text-brand-700/85">
              Quando uma entrega aberta muda de status, o painel busca a versão mais recente e
              mantém o botão Atualizar como apoio.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
