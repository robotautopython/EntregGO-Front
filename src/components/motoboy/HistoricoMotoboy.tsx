'use client';

import { Filter, MapPin, Search, Store } from 'lucide-react';
import { useMemo, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

import {
  type CourierHistoryEntry,
  type RideOutcome,
  formatCourierDayLabel,
  formatCourierTime,
  groupCourierHistory,
  outcomeTone,
  sampleCourierHistory,
} from './courier-types';

type Filter = 'todas' | RideOutcome;

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'recusada', label: 'Recusadas' },
  { value: 'expirada', label: 'Expiradas' },
];

export function HistoricoMotoboy() {
  const [filter, setFilter] = useState<Filter>('todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo<CourierHistoryEntry[]>(() => {
    return sampleCourierHistory.filter((entry) => {
      const matchesFilter = filter === 'todas' || entry.outcome === filter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        entry.store.toLowerCase().includes(term) ||
        entry.destination.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const grouped = useMemo(() => groupCourierHistory(filtered), [filtered]);

  const totalDelivered = sampleCourierHistory.filter((entry) => entry.outcome === 'entregue').length;
  const totalDeclined = sampleCourierHistory.filter((entry) => entry.outcome === 'recusada').length;
  const totalExpired = sampleCourierHistory.filter((entry) => entry.outcome === 'expirada').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sua trajetória"
        title="Suas corridas"
        description="Resumo do que você já fez pela central — entregas, recusas e solicitações que expiraram."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Entregues" value={totalDelivered} subtitle="completas" tone="success" />
        <MetricCard label="Recusadas" value={totalDeclined} subtitle="sem assumir" tone="paper" />
        <MetricCard label="Expiradas" value={totalExpired} subtitle="sem aceite" tone="danger" />
      </div>

      <Card variant="white" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Field label="Buscar loja ou destino" className="lg:max-w-md">
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-asphalt-950/45"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Nome da loja, rua, bairro..."
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Resultado
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((option) => {
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
              Tente limpar a busca ou voltar para todas pra ver tudo que você já fez na rua.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ day, items }) => (
            <section key={day} className="space-y-2">
              <header className="sticky top-16 z-10 -mx-4 flex items-center justify-between border-b border-paper-line bg-paper/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
                <p className="text-sm font-extrabold uppercase tracking-widest text-asphalt-950/70">
                  {formatCourierDayLabel(day)}
                </p>
                <p className="text-xs font-bold text-asphalt-950/55">
                  {items.length} corrida{items.length > 1 ? 's' : ''}
                </p>
              </header>

              <ul className="space-y-2">
                {items.map((entry) => {
                  const meta = outcomeTone[entry.outcome];
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-lg border border-paper-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="hidden font-mono text-sm font-extrabold tabular-nums text-asphalt-950/70 sm:inline">
                          {formatCourierTime(entry.finishedAt)}
                        </span>
                        <span className="hidden h-10 w-px bg-paper-line sm:block" />
                        <div className="min-w-0 flex-1">
                          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-asphalt-950/55">
                            <Store className="h-3 w-3" aria-hidden="true" />
                            {entry.store}
                          </p>
                          <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-extrabold text-asphalt-950">
                            <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                            {entry.destination}
                          </p>
                          <p className="mt-0.5 text-xs text-asphalt-950/55 sm:hidden">
                            {formatCourierTime(entry.finishedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
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
          Estes registros são exemplos visuais. Quando o endpoint{' '}
          <code className="font-mono text-asphalt-950">GET /api/deliveries/history</code>{' '}
          estiver ligado, suas corridas reais entram no lugar dos exemplos.
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
  tone: 'success' | 'paper' | 'danger';
}) {
  const toneMap = {
    success: 'border-success-500/30 text-success-700',
    paper: 'border-paper-line text-asphalt-950/70',
    danger: 'border-danger-500/30 text-danger-700',
  };
  return (
    <div className={cn('rounded-lg border bg-white p-5 shadow-card', toneMap[tone])}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold opacity-70">{subtitle}</p>
    </div>
  );
}
