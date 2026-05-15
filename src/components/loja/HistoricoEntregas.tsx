'use client';

import { Bike, ChevronDown, Filter, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

import {
  type DeliveryStatus,
  formatDayLabel,
  formatTime,
  groupHistoryByDay,
  sampleHistory,
  statusLabel,
  statusTone,
} from './delivery-types';

type StatusFilter = 'todos' | 'entregue' | 'expirada' | 'cancelada';

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'expirada', label: 'Expirados' },
  { value: 'cancelada', label: 'Cancelados' },
];

export function HistoricoEntregas() {
  const [filter, setFilter] = useState<StatusFilter>('todos');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sampleHistory.filter((entry) => {
      const matchesFilter =
        filter === 'todos' ||
        (filter === 'entregue' && entry.status === 'entregue') ||
        (filter === 'expirada' && entry.status === 'expirada') ||
        (filter === 'cancelada' && entry.status === 'cancelada');
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        entry.destination.toLowerCase().includes(term) ||
        (entry.courier?.toLowerCase().includes(term) ?? false);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const grouped = useMemo(() => groupHistoryByDay(filtered), [filtered]);

  const totalDelivered = sampleHistory.filter((entry) => entry.status === 'entregue').length;
  const totalExpired = sampleHistory.filter((entry) => entry.status === 'expirada').length;
  const totalCancelled = sampleHistory.filter((entry) => entry.status === 'cancelada').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Histórico de entregas"
        description="Cada solicitação registrada por dia. Toque numa linha para abrir os detalhes."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total" value={sampleHistory.length} subtitle="solicitações" tone="paper" />
        <MetricCard label="Entregues" value={totalDelivered} subtitle="conclusões" tone="success" />
        <MetricCard label="Expirados" value={totalExpired} subtitle="ninguém aceitou" tone="danger" />
        <MetricCard label="Cancelados" value={totalCancelled} subtitle="pela loja" tone="warn" />
      </div>

      <Card variant="white" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Field label="Buscar destino ou motoboy" className="lg:max-w-md">
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-asphalt-950/45"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Rua, bairro, nome..."
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>

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
                    onClick={() => setFilter(option.value)}
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
        </div>
      </Card>

      {grouped.length === 0 ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-10">
            <BoxMark size={96} tone="paper" />
            <p className="text-base font-extrabold text-asphalt-950">
              Nada por aqui pra esses filtros.
            </p>
            <p className="max-w-md text-sm text-asphalt-950/65">
              Tente limpar a busca ou voltar para &ldquo;Todos&rdquo; para ver tudo que sua loja já enviou pra rede.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ day, items }) => (
            <section key={day} className="space-y-2">
              <header className="sticky top-16 z-10 -mx-4 flex items-center justify-between border-b border-paper-line bg-paper/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
                <p className="text-sm font-extrabold uppercase tracking-widest text-asphalt-950/70">
                  {formatDayLabel(day)}
                </p>
                <p className="text-xs font-bold text-asphalt-950/55">
                  {items.length} entrega{items.length > 1 ? 's' : ''}
                </p>
              </header>

              <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line bg-white shadow-card">
                {items.map((entry) => {
                  const isOpen = expanded === entry.id;
                  const status: DeliveryStatus = entry.status;
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
                          {formatTime(entry.createdAt)}
                        </span>
                        <span className="hidden h-10 w-px bg-paper-line sm:block" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-asphalt-950">
                            {entry.destination}
                          </p>
                          {entry.courier ? (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-asphalt-950/65">
                              <Bike className="h-3.5 w-3.5" aria-hidden="true" />
                              {entry.courier}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs font-semibold text-asphalt-950/55">
                              Sem motoboy atribuído
                            </p>
                          )}
                        </div>
                        <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
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
                          <div className="space-y-3 border-t border-paper-line px-5 py-4 text-sm text-asphalt-950/80">
                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                              <span>
                                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                                  Destino
                                </span>
                                {entry.destination}
                              </span>
                            </p>
                            {entry.notes ? (
                              <p className="rounded-md bg-white p-3">
                                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                                  Observação
                                </span>
                                <span className="mt-1 block">{entry.notes}</span>
                              </p>
                            ) : null}
                            <p className="text-xs text-asphalt-950/55">
                              ID interno: <span className="font-mono">{entry.id}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Card variant="paper" className="border-dashed">
        <p className="text-sm font-bold text-asphalt-950">Dados de demonstração</p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          Estes registros são exemplos visuais. Quando o endpoint <code className="font-mono text-asphalt-950">GET /api/deliveries/mine</code> estiver ligado, o histórico real toma o lugar dos exemplos sem mudar o layout.
        </p>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  tone,
}: {
  label: string;
  value: number;
  subtitle: string;
  tone: 'paper' | 'success' | 'danger' | 'warn';
}) {
  const toneMap = {
    paper: 'border-paper-line text-asphalt-950/70',
    success: 'border-success-500/30 text-success-700',
    danger: 'border-danger-500/30 text-danger-700',
    warn: 'border-warn-500/30 text-warn-700',
  };

  return (
    <div className={cn('rounded-lg border bg-white p-5 shadow-card', toneMap[tone])}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold opacity-70">{subtitle}</p>
    </div>
  );
}
