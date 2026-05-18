'use client';

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Loader2,
  Mail,
  MapPin,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Store,
  Unlock,
  Wallet,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, listAdminUserDeliveries, listAdminUserPayments } from '@/lib/api';
import { cn } from '@/lib/cn';
import type {
  AdminCourierProfile,
  AdminStoreProfile,
  AdminUserDetail,
  DomainUser,
  UserRole,
  UserStatus,
} from '@/types/auth';
import type {
  AdminUserDeliveriesResult,
  AdminUserDeliveryListItem,
  DeliveryRequestStatus,
} from '@/types/delivery';
import type {
  AdminUserPaymentListItem,
  AdminUserPaymentsResult,
} from '@/types/payment';

interface UserDetailDrawerProps {
  accessToken: string;
  user: DomainUser | null;
  detail: AdminUserDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;
  currentUserId: string;
  activeAction: string | null;
  onClose: () => void;
  onAction: (user: DomainUser, action: 'approve' | 'block' | 'unblock') => void;
}

type TabKey = 'perfil' | 'documentos' | 'entregas' | 'pagamento' | 'notas';

const tabs: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: 'perfil', label: 'Perfil', icon: ShieldCheck },
  { key: 'documentos', label: 'Documentos', icon: FileText },
  { key: 'entregas', label: 'Entregas', icon: PackageOpen },
  { key: 'pagamento', label: 'Pagamento', icon: Wallet },
  { key: 'notas', label: 'Notas', icon: Mail },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  logista: 'Loja',
  motoboy: 'Motoboy',
};

const statusMeta: Record<
  UserStatus,
  { tone: 'success' | 'warn' | 'danger'; label: string; pulse: boolean }
> = {
  pendente: { tone: 'warn', label: 'Pendente', pulse: true },
  ativo: { tone: 'success', label: 'Ativo', pulse: false },
  bloqueado: { tone: 'danger', label: 'Bloqueado', pulse: false },
};

type DeliveryStatusFilter = 'todos' | DeliveryRequestStatus;
type PaymentPaidFilter = 'todos' | 'pendentes' | 'pagos';

const DELIVERY_PAGE_SIZE = 10;
const PAYMENT_PAGE_SIZE = 10;

const deliveryStatusFilters: Array<{ value: DeliveryStatusFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'coletada', label: 'Coletada' },
  { value: 'em_transito', label: 'Em transito' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const deliveryStatusLabel: Record<DeliveryRequestStatus, string> = {
  aguardando: 'Aguardando',
  aceita: 'Aceita',
  coletada: 'Coletada',
  em_transito: 'Em transito',
  entregue: 'Entregue',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
};

const deliveryStatusTone: Record<
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

const paymentPaidFilters: Array<{ value: PaymentPaidFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendentes', label: 'Pendentes' },
  { value: 'pagos', label: 'Pagos' },
];

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDeliveryDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getAvailableActions(
  user: DomainUser,
  currentUserId: string,
): Array<'approve' | 'block' | 'unblock'> {
  if (user.id === currentUserId) return [];
  if (user.status === 'pendente') return ['approve', 'block'];
  if (user.status === 'bloqueado') return ['unblock'];
  return ['block'];
}

export function UserDetailDrawer({
  accessToken,
  user,
  detail,
  isLoadingDetail,
  detailError,
  currentUserId,
  activeAction,
  onClose,
  onAction,
}: UserDetailDrawerProps) {
  const [tab, setTab] = useState<TabKey>('perfil');

  useEffect(() => {
    if (!user) return;
    setTab('perfil');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [user, onClose]);

  if (!user) return null;

  const displayUser = detail?.user ?? user;
  const meta = statusMeta[displayUser.status];
  const isMe = displayUser.id === currentUserId;
  const actions = getAvailableActions(displayUser, currentUserId);
  const initials = displayUser.email.split('@')[0]?.slice(0, 2).toUpperCase() ?? 'EG';

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-asphalt-950/40"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col border-l border-paper-line bg-paper shadow-ink animate-slide-in-left">
        <header className="flex items-center justify-between gap-3 border-b border-paper-line bg-white px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-asphalt-950 text-base font-extrabold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                {roleLabels[displayUser.role]}
              </p>
              <p className="truncate text-base font-black text-asphalt-950">
                {displayUser.email}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge tone={meta.tone} pulsing={meta.pulse}>
                  {meta.label}
                </Badge>
                {isMe ? <Badge tone="paper">Sessão atual</Badge> : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-asphalt-950/65 hover:bg-paper-deep hover:text-asphalt-950"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-paper-line bg-white px-3 py-2"
          aria-label="Abas do perfil"
        >
          {tabs.map((tabDef) => {
            const Icon = tabDef.icon;
            const active = tab === tabDef.key;
            return (
              <button
                key={tabDef.key}
                type="button"
                onClick={() => setTab(tabDef.key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-extrabold uppercase tracking-wide transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-asphalt-950/65 hover:bg-paper-deep hover:text-asphalt-950',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tabDef.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'perfil' ? (
            <PerfilTab
              user={displayUser}
              detail={detail}
              isLoadingDetail={isLoadingDetail}
              detailError={detailError}
            />
          ) : null}
          {tab === 'documentos' ? <DocumentosTab user={displayUser} /> : null}
          {tab === 'entregas' ? <EntregasTab accessToken={accessToken} user={displayUser} /> : null}
          {tab === 'pagamento' ? (
            <PagamentoTab accessToken={accessToken} user={displayUser} />
          ) : null}
          {tab === 'notas' ? <NotasTab /> : null}
        </div>

        {actions.length > 0 ? (
          <footer className="flex flex-wrap gap-2 border-t border-paper-line bg-white px-5 py-3">
            {actions.map((action) => {
              const actionKey = `${action}:${displayUser.id}`;
              const isBusy = activeAction === actionKey;
              const Icon =
                action === 'approve'
                  ? CheckCircle2
                  : action === 'unblock'
                    ? Unlock
                    : Ban;
              const label =
                action === 'approve'
                  ? 'Aprovar'
                  : action === 'unblock'
                    ? 'Desbloquear'
                    : 'Bloquear';
              const tone =
                action === 'approve'
                  ? 'bg-success-500 text-white hover:bg-success-700 shadow-pop'
                  : action === 'unblock'
                    ? 'bg-white text-asphalt-950 border border-paper-line hover:border-brand-300'
                    : 'bg-danger-500 text-white hover:bg-danger-700';

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction(displayUser, action)}
                  disabled={Boolean(activeAction)}
                  className={cn(
                    'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-extrabold transition-all duration-ui ease-ride disabled:opacity-60',
                    tone,
                  )}
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {label}
                </button>
              );
            })}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

function PerfilTab({
  user,
  detail,
  isLoadingDetail,
  detailError,
}: {
  user: DomainUser;
  detail: AdminUserDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;
}) {
  return (
    <div className="space-y-3">
      {isLoadingDetail ? (
        <Alert tone="info" title="Carregando perfil">
          Buscando dados administrativos expandidos.
        </Alert>
      ) : null}
      {detailError ? (
        <Alert tone="warn" title="Perfil parcial">
          {detailError}
        </Alert>
      ) : null}

      <KeyValueCard label="ID interno" value={<span className="font-mono">{user.id}</span>} />
      <KeyValueCard label="Auth ID" value={<span className="font-mono">{user.auth_id}</span>} />
      <KeyValueCard label="Email" value={user.email} />
      <KeyValueCard label="Perfil" value={roleLabels[user.role]} />
      <KeyValueCard
        label="Status"
        value={
          <Badge
            tone={statusMeta[user.status].tone}
            pulsing={statusMeta[user.status].pulse}
          >
            {statusMeta[user.status].label}
          </Badge>
        }
      />
      <KeyValueCard
        label="Cadastrado em"
        value={
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Clock3 className="h-3.5 w-3.5 text-asphalt-950/55" aria-hidden="true" />
            {formatDate(user.created_at)}
          </span>
        }
      />
      <KeyValueCard
        label="Aprovado em"
        value={
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Clock3 className="h-3.5 w-3.5 text-asphalt-950/55" aria-hidden="true" />
            {formatDate(user.approved_at)}
          </span>
        }
      />
      <KeyValueCard
        label="Aprovado por"
        value={
          user.approved_by ? (
            <span className="font-mono text-xs">{user.approved_by}</span>
          ) : (
            <span className="text-asphalt-950/55">—</span>
          )
        }
      />
      <KeyValueCard
        label="Última atualização"
        value={
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Clock3 className="h-3.5 w-3.5 text-asphalt-950/55" aria-hidden="true" />
            {formatDate(user.updated_at)}
          </span>
        }
      />
      {detail?.profile ? <ExpandedProfileCards profile={detail.profile} /> : null}
      {detail && !detail.profile && user.role === 'admin' ? (
        <KeyValueCard label="Perfil administrativo" value="Admin sem perfil operacional" />
      ) : null}
    </div>
  );
}

function isStoreProfile(
  profile: AdminStoreProfile | AdminCourierProfile,
): profile is AdminStoreProfile {
  return 'name' in profile;
}

function ExpandedProfileCards({
  profile,
}: {
  profile: AdminStoreProfile | AdminCourierProfile;
}) {
  if (isStoreProfile(profile)) {
    return (
      <>
        <KeyValueCard label="Nome da loja" value={profile.name} />
        <KeyValueCard label="Responsavel" value={profile.owner_name} />
        <KeyValueCard label="Endereco operacional" value={profile.address} />
        <KeyValueCard
          label="Descricao"
          value={profile.description || <span className="text-asphalt-950/55">---</span>}
        />
        <KeyValueCard
          label="Perfil atualizado em"
          value={<span className="font-mono text-xs">{formatDate(profile.updated_at)}</span>}
        />
      </>
    );
  }

  return (
    <>
      <KeyValueCard label="Nome completo" value={profile.full_name} />
      <KeyValueCard
        label="Disponibilidade"
        value={
          <Badge tone={profile.is_online ? 'success' : 'paper'}>
            {profile.is_online ? 'Online' : 'Offline'}
          </Badge>
        }
      />
      <KeyValueCard
        label="Perfil atualizado em"
        value={<span className="font-mono text-xs">{formatDate(profile.updated_at)}</span>}
      />
    </>
  );
}

function DocumentosTab({ user }: { user: DomainUser }) {
  return (
    <div className="space-y-4">
      <Alert tone="warn" title="Visualização de documentos bloqueada">
        <p className="leading-6">
          Mostrar logo de loja e foto da CNH exige pipeline seguro de Storage com signed
          URLs, RLS no bucket e auditoria de visualização (LGPD). O Security Validator
          precisa aprovar antes desta aba ser ligada à API.
        </p>
      </Alert>

      <Card variant="paper" className="border-dashed">
        <p className="text-sm font-bold text-asphalt-950">O que vem aqui</p>
        <ul className="mt-2 space-y-1.5 text-xs text-asphalt-950/70">
          {user.role === 'logista' ? (
            <li>· Logo da loja em alta resolução, com lightbox</li>
          ) : null}
          {user.role === 'motoboy' ? (
            <>
              <li>· Foto da moto enviada no cadastro</li>
              <li>· Foto da CNH (com mascaramento de número/nome quando aplicável)</li>
              <li>· Registro de quem visualizou e quando</li>
            </>
          ) : null}
          {user.role === 'admin' ? (
            <li>· Admins não têm documentos cadastrados.</li>
          ) : null}
        </ul>
      </Card>

      <Card variant="paper" className="border-dashed">
        <p className="text-xs text-asphalt-950/65">
          Endpoint necessario (ainda nao existe no backend):{' '}
          <code className="font-mono text-asphalt-950">GET</code> de signed URL por documento,
          com auditoria de visualizacao.
        </p>
      </Card>
    </div>
  );
}

interface UserDeliveriesError {
  title: string;
  message: string;
}

function mapUserDeliveriesError(error: unknown): UserDeliveriesError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Nao foi possivel carregar entregas',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_NOT_FOUND':
      return {
        title: 'Usuario nao encontrado',
        message: 'O cadastro pode ter sido removido antes da consulta.',
      };
    case 'ADMIN_USER_DELIVERIES_PROFILE_FAILED':
      return {
        title: 'Perfil operacional ausente',
        message: 'Nao foi possivel localizar o perfil vinculado a este usuario.',
      };
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
        message: 'Somente administradores ativos podem ver entregas por usuario.',
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

function DeliveryTimeline({ delivery }: { delivery: AdminUserDeliveryListItem }) {
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
    <dl className="grid gap-2 text-xs sm:grid-cols-2">
      {steps.map(([label, value]) => (
        <div key={label} className="rounded-md bg-paper px-3 py-2">
          <dt className="font-extrabold uppercase tracking-wide text-asphalt-950/55">{label}</dt>
          <dd className="mt-1 font-mono font-bold text-asphalt-950/80">
            {formatDeliveryDate(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function EntregasTab({ accessToken, user }: { accessToken: string; user: DomainUser }) {
  const [filter, setFilter] = useState<DeliveryStatusFilter>('todos');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminUserDeliveriesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UserDeliveriesError | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminUserDeliveries(accessToken, user.id, {
        page,
        limit: DELIVERY_PAGE_SIZE,
        ...(filter === 'todos' ? {} : { status: filter }),
      });
      setResult(data ?? null);
    } catch (caught) {
      setResult(null);
      setError(mapUserDeliveriesError(caught));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filter, page, user.id]);

  useEffect(() => {
    setFilter('todos');
    setPage(1);
    setResult(null);
    setError(null);
  }, [user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleFilter(next: DeliveryStatusFilter) {
    setPage(1);
    setFilter(next);
  }

  const items = useMemo(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / DELIVERY_PAGE_SIZE) : 1;

  return (
    <section className="space-y-4" aria-label="Entregas do usuario">
      <Card variant="paper" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {deliveryStatusFilters.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilter(option.value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition-all duration-ui ease-ride',
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
          <div className="flex flex-col items-center gap-3 py-8 text-asphalt-950/70">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
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
          <div className="flex flex-col items-center gap-3 py-8">
            <PackageOpen className="h-8 w-8 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-extrabold text-asphalt-950">Nenhuma entrega encontrada.</p>
            <p className="max-w-sm text-xs text-asphalt-950/65">
              {user.role === 'admin'
                ? 'Admins nao possuem entregas operacionais vinculadas.'
                : filter === 'todos'
                  ? 'Nao ha entregas relacionadas a este usuario.'
                  : 'Nao ha entregas relacionadas a este usuario com esse status.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-asphalt-950/55">
            Pagina {page} de {totalPages} - {items.length} entrega
            {items.length === 1 ? '' : 's'} nesta pagina - {total} no total
          </p>

          <ul className="space-y-3">
            {items.map((delivery) => (
              <li key={delivery.id} className="rounded-md border border-paper-line bg-white p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={deliveryStatusTone[delivery.status]}>
                      {deliveryStatusLabel[delivery.status]}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-asphalt-950/45">
                      {delivery.id}
                    </span>
                  </div>

                  <div className="grid gap-3">
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

                  <DeliveryTimeline delivery={delivery} />

                  <ButtonLink
                    href={`/admin/entregas/${delivery.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    <PackageOpen className="h-4 w-4" aria-hidden="true" />
                    Abrir detalhe
                  </ButtonLink>
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
    </section>
  );
}

interface UserPaymentsError {
  title: string;
  message: string;
}

function mapUserPaymentsError(error: unknown): UserPaymentsError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Nao foi possivel carregar pagamentos',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'USER_NOT_FOUND':
      return {
        title: 'Usuario nao encontrado',
        message: 'O cadastro pode ter sido removido antes da consulta.',
      };
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
        message: 'Somente administradores ativos podem ver pagamentos por usuario.',
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

function formatReferenceMonth(value: string): string {
  const [year, month] = value.split('-');
  return month && year ? `${month}/${year}` : value;
}

function formatDueDate(value: string): string {
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function PaymentTimeline({ payment }: { payment: AdminUserPaymentListItem }) {
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
            {formatDeliveryDate(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PagamentoTab({ accessToken, user }: { accessToken: string; user: DomainUser }) {
  const [filter, setFilter] = useState<PaymentPaidFilter>('todos');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminUserPaymentsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UserPaymentsError | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminUserPayments(accessToken, user.id, {
        page,
        limit: PAYMENT_PAGE_SIZE,
        ...(filter === 'todos' ? {} : { paid: filter === 'pagos' }),
      });
      setResult(data ?? null);
    } catch (caught) {
      setResult(null);
      setError(mapUserPaymentsError(caught));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filter, page, user.id]);

  useEffect(() => {
    setFilter('todos');
    setPage(1);
    setResult(null);
    setError(null);
  }, [user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleFilter(next: PaymentPaidFilter) {
    setPage(1);
    setFilter(next);
  }

  const items = useMemo(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAYMENT_PAGE_SIZE) : 1;

  return (
    <section className="space-y-4" aria-label="Pagamentos do usuario">
      <Card variant="paper" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {paymentPaidFilters.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilter(option.value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition-all duration-ui ease-ride',
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
          <div className="flex flex-col items-center gap-3 py-8 text-asphalt-950/70">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
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
          <div className="flex flex-col items-center gap-3 py-8">
            <Wallet className="h-8 w-8 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-extrabold text-asphalt-950">Nenhum pagamento encontrado.</p>
            <p className="max-w-sm text-xs text-asphalt-950/65">
              {user.role === 'admin'
                ? 'Admins nao possuem controles de pagamento operacional.'
                : filter === 'todos'
                  ? 'Nao ha controles de pagamento relacionados a este usuario.'
                  : 'Nao ha controles de pagamento relacionados a este usuario com esse status.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-asphalt-950/55">
            Pagina {page} de {totalPages} - {items.length} registro
            {items.length === 1 ? '' : 's'} nesta pagina - {total} no total
          </p>

          <ul className="space-y-3">
            {items.map((payment) => (
              <li key={payment.id} className="rounded-md border border-paper-line bg-white p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={payment.paid ? 'success' : 'warn'}>
                      {payment.paid ? 'Pago' : 'Pendente'}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-asphalt-950/45">
                      {payment.id}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <p className="flex items-start gap-2 text-sm text-asphalt-950/80">
                      <Clock3
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
                      <Wallet
                        className="mt-0.5 h-4 w-4 shrink-0 text-warn-500"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                          Vencimento
                        </span>
                        {formatDueDate(payment.due_date)}
                      </span>
                    </p>
                  </div>

                  <PaymentTimeline payment={payment} />
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
    </section>
  );
}

function NotasTab() {
  return (
    <div className="space-y-4">
      <Card variant="paper" className="border-dashed">
        <Mail className="h-5 w-5 text-asphalt-950/50" aria-hidden="true" />
        <p className="mt-2 text-sm font-bold text-asphalt-950">Notas administrativas</p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          Espaço para o admin deixar observações internas sobre o usuário (motivo de bloqueio,
          contato realizado, etc). Exige tabela{' '}
          <code className="font-mono text-asphalt-950">admin_notes</code> (não existe na M-01) e
          ADR para definir retenção e quem pode ler/escrever.
        </p>
      </Card>
    </div>
  );
}

function KeyValueCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-paper-line bg-white px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        {label}
      </p>
      <div className="mt-1 text-sm font-bold text-asphalt-950 break-words">{value}</div>
    </div>
  );
}
