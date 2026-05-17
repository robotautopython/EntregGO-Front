'use client';

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Loader2,
  RefreshCw,
  Store,
  WalletCards,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, listAdminPayments, markAdminPaymentPaid } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { UserStatus } from '@/types/auth';
import type {
  AdminPaymentListItem,
  AdminPaymentRoleFilter,
  AdminPaymentsResult,
} from '@/types/payment';

interface AdminPaymentsPanelProps {
  accessToken: string;
}

type PaidFilter = 'false' | 'true';
type RoleFilter = 'todos' | AdminPaymentRoleFilter;
type UserStatusFilter = 'todos' | UserStatus;

const PAGE_SIZE = 20;

const roleOptions: Array<{ value: RoleFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'logista', label: 'Lojas' },
  { value: 'motoboy', label: 'Motoboys' },
];

const userStatusOptions: Array<{ value: UserStatusFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'bloqueado', label: 'Bloqueado' },
];

const roleLabel: Record<AdminPaymentRoleFilter, string> = {
  logista: 'Loja',
  motoboy: 'Motoboy',
};

const userStatusLabel: Record<UserStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  bloqueado: 'Bloqueado',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return dateTimeFormatter.format(new Date(value));
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function formatReferenceMonth(value: string): string {
  const [year, month] = value.split('-');
  return month && year ? `${month}/${year}` : value;
}

interface UiError {
  title: string;
  message: string;
}

function mapListError(error: unknown): UiError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Nao foi possivel carregar pagamentos',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovacao',
        message: 'Seu cadastro admin ainda precisa estar ativo para ver pagamentos.',
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
        message: 'Entre novamente para ver os pagamentos.',
      };
    case 'API_URL_MISSING':
      return { title: 'API nao configurada', message: error.message };
    default:
      return {
        title: 'Nao foi possivel carregar pagamentos',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

function mapActionError(error: unknown): UiError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Nao foi possivel marcar como pago',
      message: 'Tente novamente. A acao e segura para retry.',
    };
  }

  switch (error.code) {
    case 'PAYMENT_NOT_FOUND':
      return {
        title: 'Pagamento nao encontrado',
        message: 'Atualize a lista e tente novamente.',
      };
    case 'FORBIDDEN_ROLE':
      return {
        title: 'Permissao negada',
        message: 'Somente administradores ativos podem confirmar pagamentos.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessao invalida',
        message: 'Entre novamente antes de confirmar o pagamento.',
      };
    default:
      return {
        title: 'Nao foi possivel marcar como pago',
        message: error.message || 'Tente novamente. A acao e segura para retry.',
      };
  }
}

function PaymentTimeline({ payment }: { payment: AdminPaymentListItem }) {
  const steps = [
    ['Criado', payment.created_at],
    ['Pago em', payment.paid_at],
    ['Atualizado', payment.updated_at],
  ] as const;

  return (
    <dl className="grid gap-2 text-xs sm:grid-cols-3">
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

export function AdminPaymentsPanel({ accessToken }: AdminPaymentsPanelProps) {
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('false');
  const [referenceMonth, setReferenceMonth] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('todos');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminPaymentsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UiError | null>(null);
  const [actionError, setActionError] = useState<UiError | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminPayments(accessToken, {
        page,
        limit: PAGE_SIZE,
        paid: paidFilter === 'true',
        ...(referenceMonth ? { referenceMonth } : {}),
        ...(roleFilter === 'todos' ? {} : { role: roleFilter }),
        ...(userStatusFilter === 'todos' ? {} : { userStatus: userStatusFilter }),
      });
      setResult(data ?? null);
    } catch (caught) {
      setError(mapListError(caught));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, paidFilter, referenceMonth, roleFilter, userStatusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetToFirstPage() {
    setPage(1);
    setActionError(null);
  }

  async function handleMarkPaid(paymentId: string) {
    if (markingId) return;

    setMarkingId(paymentId);
    setActionError(null);
    try {
      await markAdminPaymentPaid(accessToken, paymentId);
      await load();
    } catch (caught) {
      setActionError(mapActionError(caught));
    } finally {
      setMarkingId(null);
    }
  }

  const items = useMemo(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Pagamentos externos"
        description="Controle administrativo para confirmar pagamentos feitos fora da plataforma. Sem checkout, gateway, PIX, cartao, boleto ou repasse no EntregGO."
      />

      <Card variant="white" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Status do pagamento
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'false' as const, label: 'Pendentes' },
              { value: 'true' as const, label: 'Pagos' },
            ].map((option) => {
              const active = paidFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    resetToFirstPage();
                    setPaidFilter(option.value);
                  }}
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

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Mes de referencia
            <input
              type="month"
              value={referenceMonth}
              onChange={(event) => {
                resetToFirstPage();
                setReferenceMonth(event.target.value);
              }}
              className="h-11 w-full rounded-md border border-paper-line bg-white px-3 text-sm font-bold normal-case tracking-normal text-asphalt-950 outline-none transition focus:border-route-500 focus:ring-2 focus:ring-route-500/20"
            />
          </label>

          <label className="space-y-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Perfil
            <select
              value={roleFilter}
              onChange={(event) => {
                resetToFirstPage();
                setRoleFilter(event.target.value as RoleFilter);
              }}
              className="h-11 w-full rounded-md border border-paper-line bg-white px-3 text-sm font-bold normal-case tracking-normal text-asphalt-950 outline-none transition focus:border-route-500 focus:ring-2 focus:ring-route-500/20"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Status do usuario
            <select
              value={userStatusFilter}
              onChange={(event) => {
                resetToFirstPage();
                setUserStatusFilter(event.target.value as UserStatusFilter);
              }}
              className="h-11 w-full rounded-md border border-paper-line bg-white px-3 text-sm font-bold normal-case tracking-normal text-asphalt-950 outline-none transition focus:border-route-500 focus:ring-2 focus:ring-route-500/20"
            >
              {userStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {actionError ? (
        <Alert tone="danger" title={actionError.title}>
          {actionError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Carregando pagamentos...</p>
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
            <p className="text-base font-extrabold text-asphalt-950">Nenhum controle encontrado.</p>
            <p className="max-w-md text-sm text-asphalt-950/65">
              Nao ha pagamentos {paidFilter === 'true' ? 'pagos' : 'pendentes'} para os filtros
              selecionados.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-asphalt-950/55">
            Pagina {page} de {totalPages} - {items.length} registro
            {items.length === 1 ? '' : 's'} nesta pagina - {total} no total
          </p>

          <ul className="space-y-3">
            {items.map((payment) => (
              <li
                key={payment.id}
                className="overflow-hidden rounded-lg border border-paper-line bg-white shadow-card"
              >
                <div className="grid gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={payment.paid ? 'success' : 'warn'}>
                        {payment.paid ? 'Pago' : 'Pendente'}
                      </Badge>
                      {payment.user.role ? (
                        <Badge tone="route">{roleLabel[payment.user.role]}</Badge>
                      ) : null}
                      {payment.user.status ? (
                        <Badge tone="paper">{userStatusLabel[payment.user.status]}</Badge>
                      ) : null}
                      <span className="font-mono text-xs font-bold text-asphalt-950/45">
                        {payment.id}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
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
                            {payment.user.store_name || 'Nao se aplica'}
                          </span>
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-sm text-asphalt-950/80">
                        <CalendarDays
                          className="mt-0.5 h-4 w-4 shrink-0 text-route-600"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                            Referencia
                          </span>
                          {formatReferenceMonth(payment.reference_month)}
                        </span>
                      </p>

                      <p className="flex items-start gap-2 text-sm text-asphalt-950/80">
                        <WalletCards
                          className="mt-0.5 h-4 w-4 shrink-0 text-warn-500"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                            Vencimento
                          </span>
                          {formatDate(payment.due_date)}
                        </span>
                      </p>
                    </div>

                    <PaymentTimeline payment={payment} />
                  </div>

                  <div className="flex items-start justify-end">
                    {payment.paid ? (
                      <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        Confirmado
                      </Badge>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        disabled={markingId !== null}
                        onClick={() => void handleMarkPaid(payment.id)}
                      >
                        {markingId === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        )}
                        Marcar pago
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || markingId !== null}
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
              disabled={page >= totalPages || markingId !== null}
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
