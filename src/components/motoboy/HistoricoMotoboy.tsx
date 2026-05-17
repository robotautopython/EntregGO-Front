'use client';

import { ChevronDown, Clock3, Filter, Loader2, MapPin, RefreshCw, Store } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, listCourierHistory } from '@/lib/api';
import { cn } from '@/lib/cn';
import type {
  CourierDeliveryHistoryItem,
  CourierDeliveryHistoryResult,
  DeliveryRequestStatus,
} from '@/types/delivery';

interface HistoricoMotoboyProps {
  accessToken: string;
}

const PAGE_SIZE = 20;

type StatusFilter = 'todos' | DeliveryRequestStatus;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'coletada', label: 'Coletada' },
  { value: 'em_transito', label: 'Em trânsito' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'cancelada', label: 'Cancelada' },
];

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

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (day === todayStr) return 'Hoje';
  if (day === yesterday) return 'Ontem';
  return dayFormatter.format(date);
}

function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

function formatDateTime(iso: string | null): string {
  if (!iso) return 'Pendente';
  return dateTimeFormatter.format(new Date(iso));
}

function groupByDay(
  items: CourierDeliveryHistoryItem[],
): Array<{ day: string; items: CourierDeliveryHistoryItem[] }> {
  const byDay = new Map<string, CourierDeliveryHistoryItem[]>();
  for (const item of items) {
    const day = item.created_at.slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(item);
    byDay.set(day, list);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, dayItems]) => ({ day, items: dayItems }));
}

interface HistoryError {
  title: string;
  message: string;
}

function mapHistoryError(error: unknown): HistoryError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Não foi possível carregar o histórico',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovação',
        message: 'Seu cadastro ainda precisa ser aprovado para ver o histórico.',
      };
    case 'USER_BLOCKED':
      return {
        title: 'Conta bloqueada',
        message: 'Sua conta está bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
    case 'COURIER_PROFILE_REQUIRED':
      return {
        title: 'Permissão negada',
        message: 'Somente um motoboy ativo pode ver este histórico.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessão inválida',
        message: 'Entre novamente para ver seu histórico.',
      };
    case 'API_URL_MISSING':
      return { title: 'API não configurada', message: error.message };
    default:
      return {
        title: 'Não foi possível carregar o histórico',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

export function HistoricoMotoboy({ accessToken }: HistoricoMotoboyProps) {
  const [filter, setFilter] = useState<StatusFilter>('todos');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [result, setResult] = useState<CourierDeliveryHistoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<HistoryError | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCourierHistory(accessToken, {
        page,
        limit: PAGE_SIZE,
        ...(filter === 'todos' ? {} : { status: filter }),
      });
      setResult(data ?? null);
    } catch (caught) {
      setError(mapHistoryError(caught));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleFilter(next: StatusFilter) {
    setExpanded(null);
    setPage(1);
    setFilter(next);
  }

  const items = useMemo(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const grouped = useMemo(() => groupByDay(items), [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Suas corridas"
        description="Corridas reais atribuídas ao seu perfil, mais recentes primeiro."
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
            <p className="text-sm font-semibold">Carregando histórico...</p>
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
      ) : grouped.length === 0 ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-10">
            <BoxMark size={96} tone="paper" />
            <p className="text-base font-extrabold text-asphalt-950">
              Nenhuma corrida encontrada.
            </p>
            <p className="max-w-md text-sm text-asphalt-950/65">
              {filter === 'todos'
                ? 'Quando você aceitar uma entrega, ela aparece por aqui.'
                : 'Nenhuma corrida com esse status.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-xs font-bold text-asphalt-950/55">
            Página {page} de {totalPages} · {items.length} corrida
            {items.length === 1 ? '' : 's'} nesta página · {total} no total
            {filter === 'todos' ? '' : ` (status ${statusLabel[filter]})`}
          </p>

          {grouped.map(({ day, items: dayItems }) => (
            <section key={day} className="space-y-2">
              <header className="sticky top-16 z-10 -mx-4 flex items-center justify-between border-b border-paper-line bg-paper/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
                <p className="text-sm font-extrabold uppercase tracking-widest text-asphalt-950/70">
                  {formatDayLabel(day)}
                </p>
                <p className="text-xs font-bold text-asphalt-950/55">
                  {dayItems.length} corrida{dayItems.length === 1 ? '' : 's'}
                </p>
              </header>

              <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line bg-white shadow-card">
                {dayItems.map((entry) => {
                  const isOpen = expanded === entry.id;
                  const destination = entry.destination_address?.trim();
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : entry.id)}
                        aria-expanded={isOpen}
                        className={cn(
                          'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors',
                          isOpen ? 'bg-paper' : 'hover:bg-paper-deep/50',
                        )}
                      >
                        <span className="font-mono text-sm font-extrabold tabular-nums text-asphalt-950/70">
                          {formatTime(entry.created_at)}
                        </span>
                        <span className="hidden h-10 w-px bg-paper-line sm:block" />
                        <div className="min-w-0 flex-1">
                          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-asphalt-950/55">
                            <Store className="h-3 w-3" aria-hidden="true" />
                            {entry.store.name}
                          </p>
                          {destination ? (
                            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-extrabold text-asphalt-950">
                              <MapPin
                                className="h-3.5 w-3.5 shrink-0 text-brand-600"
                                aria-hidden="true"
                              />
                              {destination}
                            </p>
                          ) : null}
                        </div>
                        <Badge tone={statusTone[entry.status]}>{statusLabel[entry.status]}</Badge>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-asphalt-950/45 transition-transform duration-ui ease-ride',
                            isOpen && 'rotate-180 text-brand-600',
                          )}
                          aria-hidden="true"
                        />
                      </button>

                      <div
                        className={cn(
                          'grid overflow-hidden bg-paper transition-all duration-ride ease-ride',
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <div className="min-h-0">
                          <div className="space-y-4 border-t border-paper-line px-5 py-4 text-sm text-asphalt-950/80">
                            {entry.notes ? (
                              <p className="rounded-md bg-white p-3">
                                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                                  Observação da loja
                                </span>
                                <span className="mt-1 block">{entry.notes}</span>
                              </p>
                            ) : null}
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              <TimelineItem label="Criada" value={formatDateTime(entry.created_at)} />
                              <TimelineItem label="Aceita" value={formatDateTime(entry.accepted_at)} />
                              <TimelineItem
                                label="Coletada"
                                value={formatDateTime(entry.collected_at)}
                              />
                              <TimelineItem
                                label="Em trânsito"
                                value={formatDateTime(entry.in_transit_at)}
                              />
                              <TimelineItem
                                label="Entregue"
                                value={formatDateTime(entry.delivered_at)}
                              />
                              <TimelineItem
                                label="Atualizada"
                                value={formatDateTime(entry.updated_at)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs font-bold text-asphalt-950/55">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-paper-line bg-white p-3">
      <p className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        <Clock3 className="h-3 w-3" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 font-mono text-xs font-extrabold tabular-nums text-asphalt-950">
        {value}
      </p>
    </div>
  );
}
