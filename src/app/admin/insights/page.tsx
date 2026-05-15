'use client';

import { Bike, Clock3, Loader2, RefreshCw, Store, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { OperationalShell } from '@/components/shell/OperationalShell';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, getAdminInsights } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { AdminInsights, UserRole, UserStatus } from '@/types/auth';

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  logista: 'Loja',
  motoboy: 'Motoboy',
};

const statusLabels: Record<UserStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  bloqueado: 'Bloqueado',
};

const statusTones: Record<UserStatus, 'warn' | 'success' | 'danger'> = {
  pendente: 'warn',
  ativo: 'success',
  bloqueado: 'danger',
};

const roleOrder = ['admin', 'logista', 'motoboy'] as const satisfies readonly UserRole[];
const statusOrder = ['pendente', 'ativo', 'bloqueado'] as const satisfies readonly UserStatus[];

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const getTotalUsers = (insights: AdminInsights) =>
  roleOrder.reduce(
    (roleTotal, role) =>
      roleTotal +
      statusOrder.reduce((statusTotal, status) => statusTotal + insights.user_counts[role][status], 0),
    0,
  );

export default function AdminInsightsPage() {
  return (
    <OperationalShell role="admin" title="Insights" showSearch={false}>
      {({ accessToken }) => <AdminInsightsPanel accessToken={accessToken} />}
    </OperationalShell>
  );
}

function AdminInsightsPanel({ accessToken }: { accessToken: string }) {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminInsights(accessToken);
      if (result) setInsights(result);
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Nao foi possivel carregar os insights.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const totalUsers = useMemo(() => (insights ? getTotalUsers(insights) : 0), [insights]);
  const pendingUsersCount = useMemo(
    () =>
      insights
        ? roleOrder.reduce((total, role) => total + insights.user_counts[role].pendente, 0)
        : 0,
    [insights],
  );
  const isEmpty =
    Boolean(insights) &&
    totalUsers === 0 &&
    insights?.active_accounts.stores === 0 &&
    insights?.active_accounts.couriers === 0 &&
    insights?.latest_pending_users.items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analise operacional"
        title="Insights da central"
        description="Resumo administrativo vindo da API do backend, sem dados simulados."
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={() => void loadInsights()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="Falha ao carregar">
          <div className="space-y-3">
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={() => void loadInsights()}>
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      ) : null}

      {isLoading && !insights ? <InsightsLoading /> : null}

      {!isLoading && !error && isEmpty ? (
        <Alert tone="info" title="Sem dados ainda">
          A API respondeu, mas ainda nao ha usuarios ou cadastros pendentes para resumir.
        </Alert>
      ) : null}

      {insights ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard
              label="Usuarios"
              value={totalUsers}
              subtitle={`${pendingUsersCount} pendentes`}
              icon={Users}
              tone="brand"
            />
            <MetricCard
              label="Lojas ativas"
              value={insights.active_accounts.stores}
              subtitle="contas liberadas"
              icon={Store}
              tone="success"
            />
            <MetricCard
              label="Motoboys ativos"
              value={insights.active_accounts.couriers}
              subtitle="contas liberadas"
              icon={Bike}
              tone="route"
            />
            <MetricCard
              label="Gerado em"
              value={formatDateTime(insights.generated_at)}
              subtitle="horario da API"
              icon={Clock3}
              tone="paper"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <Card className="overflow-hidden p-0">
              <div className="border-b border-paper-line px-5 py-4">
                <p className="text-sm font-extrabold text-asphalt-950">
                  Usuarios por perfil e status
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead className="bg-paper-deep text-xs uppercase tracking-wide text-asphalt-950/60">
                    <tr>
                      <th className="border-b border-paper-line px-5 py-3 font-extrabold">
                        Perfil
                      </th>
                      {statusOrder.map((status) => (
                        <th
                          key={status}
                          className="border-b border-paper-line px-5 py-3 font-extrabold"
                        >
                          {statusLabels[status]}
                        </th>
                      ))}
                      <th className="border-b border-paper-line px-5 py-3 font-extrabold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleOrder.map((role) => {
                      const roleTotal = statusOrder.reduce(
                        (total, status) => total + insights.user_counts[role][status],
                        0,
                      );

                      return (
                        <tr key={role} className="border-b border-paper-line last:border-b-0">
                          <td className="px-5 py-4 font-bold text-asphalt-950">
                            {roleLabels[role]}
                          </td>
                          {statusOrder.map((status) => (
                            <td key={status} className="px-5 py-4">
                              <Badge tone={statusTones[status]}>
                                {insights.user_counts[role][status]}
                              </Badge>
                            </td>
                          ))}
                          <td className="px-5 py-4 font-mono text-sm font-extrabold tabular-nums text-asphalt-950">
                            {roleTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-0">
              <div className="border-b border-paper-line px-5 py-4">
                <p className="text-sm font-extrabold text-asphalt-950">
                  Ultimos cadastros pendentes
                </p>
                <p className="mt-1 text-xs font-semibold text-asphalt-950/55">
                  Limite do backend: {insights.latest_pending_users.limit}
                </p>
              </div>
              <div className="divide-y divide-paper-line">
                {insights.latest_pending_users.items.length > 0 ? (
                  insights.latest_pending_users.items.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="brand">{roleLabels[user.role]}</Badge>
                          <Badge tone="warn">{statusLabels[user.status]}</Badge>
                        </div>
                        <p className="mt-2 truncate font-mono text-xs text-asphalt-950/55">
                          ID {user.id}
                        </p>
                      </div>
                      <p className="shrink-0 text-right font-mono text-xs font-semibold text-asphalt-950/65">
                        {formatDateTime(user.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-sm font-semibold text-asphalt-950/60">
                    Nenhum cadastro pendente no retorno atual.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function InsightsLoading() {
  return (
    <div className="grid gap-3 md:grid-cols-4" aria-live="polite" aria-busy="true">
      {['usuarios', 'lojas', 'motoboys', 'geracao'].map((item) => (
        <div
          key={item}
          className="min-h-32 animate-pulse rounded-lg border border-paper-line bg-white p-5 shadow-card"
        >
          <div className="h-4 w-24 rounded bg-paper-deep" />
          <div className="mt-5 h-9 w-20 rounded bg-paper-deep" />
          <div className="mt-3 h-3 w-32 rounded bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  subtitle: string;
  icon: typeof Users;
  tone: 'brand' | 'route' | 'success' | 'paper';
}) {
  const toneMap = {
    brand: 'border-brand-200 bg-brand-50 text-brand-700',
    route: 'border-route-200 bg-route-50 text-route-700',
    success: 'border-success-500/20 bg-success-50 text-success-700',
    paper: 'border-paper-line bg-white text-asphalt-950',
  };

  return (
    <div className={cn('rounded-lg border p-5 shadow-card', toneMap[tone])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      </div>
      <p className="mt-3 break-words font-mono text-2xl font-extrabold tabular-nums text-asphalt-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold opacity-70">{subtitle}</p>
    </div>
  );
}
