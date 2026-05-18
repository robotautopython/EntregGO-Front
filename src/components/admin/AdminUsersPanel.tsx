'use client';

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Unlock,
  UserCheck,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import {
  approveUser,
  blockUser,
  ClientApiError,
  getAdminUserDetail,
  listAdminUsers,
  unblockUser,
} from '@/lib/api';
import { cn } from '@/lib/cn';
import type {
  AdminUserDetail,
  AdminUsersResult,
  AuthContext,
  DomainUser,
  UserRole,
  UserStatus,
} from '@/types/auth';

import { UserDetailDrawer } from './UserDetailDrawer';

interface AdminUsersPanelProps {
  authContext: AuthContext;
  accessToken: string;
  preset?: {
    title: string;
    eyebrow: string;
    description: string;
    forcedRole?: UserRole;
    forcedStatus?: UserStatus;
  };
}

type Filters = {
  role: '' | UserRole;
  status: '' | UserStatus;
  search: string;
};

type ActionName = 'approve' | 'block' | 'unblock';

const pageSize = 20;

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  logista: 'Loja',
  motoboy: 'Motoboy',
};

const statusToneMap: Record<
  UserStatus,
  { tone: 'warn' | 'success' | 'danger'; label: string; pulse: boolean }
> = {
  pendente: { tone: 'warn', label: 'Pendente', pulse: true },
  ativo: { tone: 'success', label: 'Ativo', pulse: false },
  bloqueado: { tone: 'danger', label: 'Bloqueado', pulse: false },
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

function StatusPill({ status }: { status: UserStatus }) {
  const meta = statusToneMap[status];
  return (
    <Badge tone={meta.tone} pulsing={meta.pulse}>
      {meta.label}
    </Badge>
  );
}

function getAvailableActions(user: DomainUser, currentUserId: string | undefined): ActionName[] {
  if (user.id === currentUserId) return [];
  if (user.status === 'pendente') return ['approve', 'block'];
  if (user.status === 'bloqueado') return ['unblock'];
  return ['block'];
}

const defaultPreset = {
  title: 'Painel Admin',
  eyebrow: 'Gestão da rede',
  description:
    'Cadastros, aprovações e bloqueios da central. Toque numa linha para abrir o perfil completo.',
};

function parseStatusFromQuery(value: string | null | undefined): UserStatus | '' {
  if (value === 'pendente' || value === 'ativo' || value === 'bloqueado') return value;
  return '';
}

export function AdminUsersPanel({ authContext, accessToken, preset }: AdminUsersPanelProps) {
  const effectivePreset = preset ?? defaultPreset;
  const forcedRole = preset?.forcedRole;
  const forcedStatus = preset?.forcedStatus;
  const searchParams = useSearchParams();
  const initialStatusFromQuery = parseStatusFromQuery(searchParams?.get('status') ?? null);

  const [users, setUsers] = useState<AdminUsersResult | null>(null);
  const [filters, setFilters] = useState<Filters>({
    role: forcedRole ?? '',
    status: forcedStatus ?? initialStatusFromQuery,
    search: '',
  });
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<DomainUser | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    if (!users?.pagination.total) return 1;
    return Math.max(1, Math.ceil(users.pagination.total / users.pagination.limit));
  }, [users]);

  const loadUsers = useCallback(
    async (nextPage = page, nextFilters = filters) => {
      setIsLoadingUsers(true);
      setError(null);

      try {
        const result = await listAdminUsers(accessToken, {
          page: nextPage,
          limit: pageSize,
          role: (forcedRole ?? nextFilters.role) || undefined,
          status: (forcedStatus ?? nextFilters.status) || undefined,
          search: nextFilters.search.trim() || undefined,
        });
        if (result) setUsers(result);
      } catch (caughtError) {
        if (caughtError instanceof ClientApiError) {
          setError(caughtError.message);
          return;
        }

        setError('Não foi possível carregar usuários.');
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [accessToken, filters, forcedRole, forcedStatus, page],
  );

  useEffect(() => {
    const statusFromUrl = parseStatusFromQuery(searchParams?.get('status') ?? null);
    const initialStatus = forcedStatus ?? statusFromUrl;
    setFilters({
      role: forcedRole ?? '',
      status: initialStatus,
      search: '',
    });
    void loadUsers(1, {
      role: forcedRole ?? '',
      status: initialStatus,
      search: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, forcedRole, forcedStatus, searchParams]);

  useEffect(() => {
    if (forcedStatus === 'pendente' || filters.status === 'pendente') {
      setPendingTotal(null);
      return;
    }
    let cancelled = false;
    async function loadPendingTotal() {
      try {
        const result = await listAdminUsers(accessToken, {
          page: 1,
          limit: 1,
          role: (forcedRole ?? filters.role) || undefined,
          status: 'pendente',
        });
        if (!cancelled && result) {
          setPendingTotal(result.pagination.total);
        }
      } catch {
        // Chip é nice-to-have; silencia falha pra não poluir o painel.
      }
    }
    void loadPendingTotal();
    return () => {
      cancelled = true;
    };
  }, [accessToken, forcedRole, forcedStatus, filters.status, filters.role]);

  function focusPendentes() {
    const next: Filters = { ...filters, status: 'pendente' };
    setFilters(next);
    setPage(1);
    setSuccess(null);
    void loadUsers(1, next);
  }

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserDetail(null);
      setUserDetailError(null);
      setIsLoadingUserDetail(false);
      return;
    }

    let cancelled = false;
    const selectedUserId = selectedUser.id;
    setSelectedUserDetail(null);
    setUserDetailError(null);
    setIsLoadingUserDetail(true);

    async function loadUserDetail() {
      try {
        const detail = await getAdminUserDetail(accessToken, selectedUserId);
        if (!cancelled && detail) {
          setSelectedUserDetail(detail);
        }
      } catch (caughtError) {
        if (cancelled) return;
        if (caughtError instanceof ClientApiError) {
          setUserDetailError(caughtError.message);
          return;
        }

        setUserDetailError('Não foi possível carregar o perfil expandido.');
      } finally {
        if (!cancelled) {
          setIsLoadingUserDetail(false);
        }
      }
    }

    void loadUserDetail();

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedUser]);

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSuccess(null);
    await loadUsers(1, filters);
  }

  async function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setSuccess(null);
    await loadUsers(nextPage, filters);
  }

  async function handleAction(user: DomainUser, action: ActionName) {
    if (activeAction) return;
    const actionKey = `${action}:${user.id}`;
    setActiveAction(actionKey);
    setError(null);
    setSuccess(null);

    try {
      let updated: DomainUser | undefined;
      if (action === 'approve') {
        updated = (await approveUser(accessToken, user.id)) ?? undefined;
        setSuccess(`${user.email} aprovado.`);
      }

      if (action === 'block') {
        updated = (await blockUser(accessToken, user.id)) ?? undefined;
        setSuccess(`${user.email} bloqueado.`);
      }

      if (action === 'unblock') {
        updated = (await unblockUser(accessToken, user.id)) ?? undefined;
        setSuccess(`${user.email} desbloqueado.`);
      }

      if (selectedUser?.id === user.id && updated) {
        setSelectedUser(updated);
        setSelectedUserDetail((current) =>
          current
            ? {
                ...current,
                user: updated,
              }
            : current,
        );
      }

      await loadUsers(page, filters);
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Não foi possível concluir a ação.');
    } finally {
      setActiveAction(null);
    }
  }

  const pendingCount = users?.items.filter((user) => user.status === 'pendente').length ?? 0;
  const showRoleFilter = !forcedRole;
  const showStatusFilter = !forcedStatus;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={effectivePreset.eyebrow}
        title={effectivePreset.title}
        description={effectivePreset.description}
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={() => void loadUsers(page, filters)}
            disabled={isLoadingUsers}
          >
            {isLoadingUsers ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        }
      />

      {pendingTotal !== null && pendingTotal > 0 && filters.status !== 'pendente' ? (
        <button
          type="button"
          onClick={focusPendentes}
          className="group flex w-full items-center justify-between gap-3 rounded-md border border-warn-500/40 bg-warn-50 px-4 py-3 text-left transition-all duration-ui ease-ride hover:border-warn-500/70 hover:bg-warn-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route-500"
          aria-label={`Filtrar somente pendentes (${pendingTotal})`}
        >
          <span className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warn-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-warn-500" />
            </span>
            <span className="text-sm font-extrabold text-warn-700">
              {pendingTotal} {pendingTotal === 1 ? 'cadastro pendente' : 'cadastros pendentes'} aguardando aprovação
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-warn-700 group-hover:text-warn-700/90">
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Ver agora
          </span>
        </button>
      ) : null}

      {(forcedRole || forcedStatus) && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-asphalt-950/55">
          <UserCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          Filtros fixos:
          {forcedRole ? <Badge tone="brand">role · {roleLabels[forcedRole]}</Badge> : null}
          {forcedStatus ? <Badge tone="warn">status · {forcedStatus}</Badge> : null}
        </div>
      )}

      <Card>
        <form
          className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end"
          onSubmit={handleFilterSubmit}
        >
          <Field label="Buscar por email" className="md:col-span-1">
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-asphalt-950/45"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="email@empresa.com"
                className="pl-10"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, search: event.target.value }))
                }
              />
            </div>
          </Field>

          {showRoleFilter ? (
            <Field label="Perfil">
              <select
                className="h-12 w-full rounded-md border border-paper-line bg-white px-3 text-sm font-semibold outline-none transition-all duration-ui ease-ride focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={filters.role}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    role: event.target.value as Filters['role'],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="logista">Loja</option>
                <option value="motoboy">Motoboy</option>
              </select>
            </Field>
          ) : (
            <div aria-hidden="true" className="hidden md:block" />
          )}

          {showStatusFilter ? (
            <Field label="Status">
              <select
                className="h-12 w-full rounded-md border border-paper-line bg-white px-3 text-sm font-semibold outline-none transition-all duration-ui ease-ride focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as Filters['status'],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="ativo">Ativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </Field>
          ) : (
            <div aria-hidden="true" className="hidden md:block" />
          )}

          <Button type="submit" variant="dark" size="lg" disabled={isLoadingUsers}>
            {isLoadingUsers ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Filtrar
          </Button>
        </form>
      </Card>

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {success ? (
        <Alert tone="success" title="Pronto">
          {success}
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Total"
          value={users?.pagination.total ?? 0}
          tone="brand"
          subtitle="usuários encontrados"
        />
        <MetricCard
          label="Pendentes nesta página"
          value={pendingCount}
          tone="warn"
          subtitle="aguardando aprovação"
        />
        <MetricCard label="Página" value={`${page} / ${totalPages}`} tone="route" subtitle="navegação" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead className="bg-paper-deep text-xs uppercase tracking-wide text-asphalt-950/60">
              <tr>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">Email</th>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">Perfil</th>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">Loja</th>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">Status</th>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">Criado em</th>
                <th className="border-b border-paper-line px-5 py-3 font-extrabold">
                  Aprovado em
                </th>
                <th className="border-b border-paper-line px-5 py-3 text-right font-extrabold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.items.map((user) => {
                const isMe = user.id === authContext.user.id;
                const isSelected = selectedUser?.id === user.id;
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      'cursor-pointer border-b border-paper-line last:border-b-0 transition-colors hover:bg-paper',
                      user.status === 'pendente' && 'bg-warn-50/40',
                      isSelected && 'bg-brand-50/70',
                    )}
                  >
                    <td className="px-5 py-3 font-bold text-asphalt-950">{user.email}</td>
                    <td className="px-5 py-3 text-asphalt-950/75">
                      {roleLabels[user.role]}
                    </td>
                    <td className="px-5 py-3 text-asphalt-950/75">
                      {user.store_name ? (
                        user.store_name
                      ) : (
                        <span className="text-asphalt-950/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={user.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-asphalt-950/65">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-asphalt-950/65">
                      {formatDate(user.approved_at)}
                    </td>
                    <td
                      className="px-5 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        {isMe ? (
                          <Badge tone="paper">Sessão atual</Badge>
                        ) : (
                          getAvailableActions(user, authContext.user.id).map((action) => {
                            const actionKey = `${action}:${user.id}`;
                            const isBusy = activeAction === actionKey;
                            const variant =
                              action === 'approve'
                                ? 'success'
                                : action === 'unblock'
                                  ? 'secondary'
                                  : 'danger';
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

                            return (
                              <Button
                                key={action}
                                size="sm"
                                variant={variant}
                                onClick={() => void handleAction(user, action)}
                                disabled={Boolean(activeAction)}
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Icon className="h-3.5 w-3.5" />
                                )}
                                {label}
                              </Button>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoadingUsers && users && users.items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-asphalt-950/65">
            Nenhum usuário encontrado pra esses filtros.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-paper-line px-5 py-4 text-sm text-asphalt-950/75 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {users?.pagination.total ?? 0} usuários · página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => void handlePageChange(page - 1)}
              disabled={page <= 1 || isLoadingUsers}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => void handlePageChange(page + 1)}
              disabled={page >= totalPages || isLoadingUsers}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <UserDetailDrawer
        key={selectedUser?.id ?? 'closed'}
        accessToken={accessToken}
        user={selectedUser}
        detail={selectedUserDetail}
        isLoadingDetail={isLoadingUserDetail}
        detailError={userDetailError}
        currentUserId={authContext.user.id}
        activeAction={activeAction}
        onClose={() => setSelectedUser(null)}
        onAction={handleAction}
      />
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
  value: number | string;
  subtitle: string;
  tone: 'brand' | 'route' | 'warn';
}) {
  const toneMap = {
    brand: 'border-brand-200 bg-brand-50 text-brand-700',
    route: 'border-route-200 bg-route-50 text-route-700',
    warn: 'border-warn-500/20 bg-warn-50 text-warn-700',
  };

  return (
    <div className={cn('rounded-lg border bg-white p-5 shadow-card', toneMap[tone])}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
        {label}
      </p>
      <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold opacity-70">{subtitle}</p>
    </div>
  );
}
