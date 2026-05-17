'use client';

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Store,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, listAdminDeliveries } from '@/lib/api';
import { cn } from '@/lib/cn';
import type {
  AdminDeliveriesResult,
  AdminDeliveryListItem,
  DeliveryRequestStatus,
} from '@/types/delivery';

interface AdminDeliveriesPanelProps {
  accessToken: string;
}

type StatusFilter = 'todos' | DeliveryRequestStatus;

const PAGE_SIZE = 20;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'coletada', label: 'Coletada' },
  { value: 'em_transito', label: 'Em transito' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const statusLabel: Record<DeliveryRequestStatus, string> = {
  aguardando: 'Aguardando',
  aceita: 'Aceita',
  coletada: 'Coletada',
  em_transito: 'Em transito',
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
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return dateTimeFormatter.format(new Date(value));
}

interface ListError {
  title: string;
  message: string;
}

function mapListError(error: unknown): ListError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Nao foi possivel carregar entregas',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovacao',
        message: 'Seu cadastro admin ainda precisa estar ativo para ver entregas.',
      };
    case 'USER_BLOCKED':
      return {
        title: 'Conta bloqueada',
        message: 'Sua conta esta bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
      return {
        title: 'Permissao negada',
        message: 'Somente administradores ativos podem ver esta listagem.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessao invalida',
        message: 'Entre novamente para ver as entregas.',
      };
    case 'API_URL_MISSING':
      return { title: 'API nao configurada', message: error.message };
    default:
      return {
        title: 'Nao foi possivel carregar entregas',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

function Timeline({ delivery }: { delivery: AdminDeliveryListItem }) {
  const steps = [
    ['Criada', delivery.created_at],
    ['Expira', delivery.expires_at],
    ['Aceita', delivery.accepted_at],
    ['Coletada', delivery.collected_at],
    ['Em transito', delivery.in_transit_at],
    ['Entregue', delivery.delivered_at],
    ['Atualizada', delivery.updated_at],
  ] as const;

  return (
    <dl className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
      {steps.map(([label, value]) => (
        <div key={label} className="rounded-md bg-paper px-3 py-2">
          <dt className="font-extrabold uppercase tracking-wide text-asphalt-950/55">{label}</dt>
          <dd className="mt-1 font-mono font-bold text-asphalt-950/80">
            {formatDateTime(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminDeliveriesPanel({ accessToken }: AdminDeliveriesPanelProps) {
  const [filter, setFilter] = useState<StatusFilter>('todos');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminDeliveriesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ListError | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminDeliveries(accessToken, {
        page,
        limit: PAGE_SIZE,
        ...(filter === 'todos' ? {} : { status: filter }),
      });
      setResult(data ?? null);
    } catch (caught) {
      setError(mapListError(caught));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleFilter(next: StatusFilter) {
    setPage(1);
    setFilter(next);
  }

  const items = useMemo(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Entregas da rede"
        description="Solicitacoes reais das lojas, em modo somente leitura, com dados operacionais permitidos para administracao."
      />

      <Card variant="white" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilter(option.value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all duration-ui ease-ride',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white shadow-pop'
                      : 'border-paper-line bg-white text-asphalt-950/70 hover:border-brand-300',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Carregando entregas...</p>
          </div>
        </Card>
      ) : error ? (
        <Alert tone="danger" title={error.title}>
          {error.message}
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      ) : items.length === 0 ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-10">
            <Clock3 className="h-10 w-10 text-brand-600" aria-hidden="true" />
            <p className="text-base font-extrabold text-asphalt-950">Nada por aqui ainda.</p>
            <p className="max-w-md text-sm text-asphalt-950/65">
              {filter === 'todos'
                ? 'Nenhuma entrega foi criada na rede.'
                : 'Nenhuma entrega com esse status.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-asphalt-950/55">
            Pagina {page} de {totalPages} - {items.length} entrega
            {items.length === 1 ? '' : 's'} nesta pagina - {total} no total
            {filter === 'todos' ? '' : ` (status ${statusLabel[filter]})`}
          </p>

          <ul className="space-y-3">
            {items.map((delivery) => (
              <li
                key={delivery.id}
                className="overflow-hidden rounded-lg border border-paper-line bg-white shadow-card"
              >
                <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone[delivery.status]}>
                        {statusLabel[delivery.status]}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-asphalt-950/45">
                        {delivery.id}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="flex items-start gap-2 text-sm text-asphalt-950/80">
                        <Store
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                            Loja
                          </span>
                          <span className="font-extrabold text-asphalt-950">
                            {delivery.store.name || 'Loja sem nome'}
                          </span>
                          <span className="mt-1 block text-asphalt-950/65">
                            {delivery.store.address || 'Endereco da loja nao informado'}
                          </span>
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-sm text-asphalt-950/80">
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-route-600"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                            Destino
                          </span>
                          {delivery.destination_address || 'Destino nao informado'}
                        </span>
                      </p>
                    </div>

                    {delivery.notes ? (
                      <p className="rounded-md bg-paper px-3 py-2 text-sm text-asphalt-950/75">
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                          Observacao
                        </span>
                        <span className="mt-1 block">{delivery.notes}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0 lg:w-[28rem]">
                    <Timeline delivery={delivery} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </Button>
            <span className="text-xs font-bold text-asphalt-950/55">
              Pagina {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Proxima
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
