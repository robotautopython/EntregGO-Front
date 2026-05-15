'use client';

import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  approveUser,
  blockUser,
  ClientApiError,
  getMe,
  listAdminUsers,
  unblockUser,
} from '@/lib/api';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { AdminUsersResult, AuthContext, DomainUser, UserRole, UserStatus } from '@/types/auth';

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

const statusLabels: Record<UserStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  bloqueado: 'Bloqueado',
};

const statusClasses: Record<UserStatus, string> = {
  pendente: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  ativo: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  bloqueado: 'border-red-200 bg-red-50 text-red-800',
};

const formatDate = (value: string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md border px-2 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function getAvailableActions(user: DomainUser, currentUserId: string | undefined): ActionName[] {
  if (user.id === currentUserId) {
    return [];
  }

  if (user.status === 'pendente') {
    return ['approve', 'block'];
  }

  if (user.status === 'bloqueado') {
    return ['unblock'];
  }

  return ['block'];
}

export function AdminUsersPanel() {
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUsersResult | null>(null);
  const [filters, setFilters] = useState<Filters>({ role: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = authContext?.user.role === 'admin' && authContext.user.status === 'ativo';
  const totalPages = useMemo(() => {
    if (!users?.pagination.total) {
      return 1;
    }

    return Math.max(1, Math.ceil(users.pagination.total / users.pagination.limit));
  }, [users]);

  const loadUsers = useCallback(
    async (token: string, nextPage = page, nextFilters = filters) => {
      setIsLoadingUsers(true);
      setError(null);

      try {
        const result = await listAdminUsers(token, {
          page: nextPage,
          limit: pageSize,
          role: nextFilters.role || undefined,
          status: nextFilters.status || undefined,
          search: nextFilters.search.trim() || undefined,
        });
        setUsers(result);
      } catch (caughtError) {
        if (caughtError instanceof ClientApiError) {
          setError(caughtError.message);
          return;
        }

        setError('Nao foi possivel carregar usuarios.');
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [filters, page],
  );

  useEffect(() => {
    async function boot() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();

        if (!data.session?.access_token) {
          setError('Sessao local nao encontrada.');
          return;
        }

        const me = await getMe(data.session.access_token);
        setAuthContext(me);
        setAccessToken(data.session.access_token);

        if (me.user.role === 'admin' && me.user.status === 'ativo') {
          await loadUsers(data.session.access_token, 1, filters);
        } else {
          setError('Perfil sem permissao para acessar o painel admin.');
        }
      } catch (caughtError) {
        if (caughtError instanceof ClientApiError) {
          setError(caughtError.message);
          return;
        }

        setError('Nao foi possivel validar a sessao.');
      } finally {
        setIsBooting(false);
      }
    }

    void boot();
    // loadUsers is intentionally stable enough for boot; filter submits control reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || !canManage) {
      return;
    }

    setPage(1);
    setSuccess(null);
    await loadUsers(accessToken, 1, filters);
  }

  async function handlePageChange(nextPage: number) {
    if (!accessToken || !canManage || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
    setSuccess(null);
    await loadUsers(accessToken, nextPage, filters);
  }

  async function handleAction(user: DomainUser, action: ActionName) {
    if (!accessToken || activeAction) {
      return;
    }

    const actionKey = `${action}:${user.id}`;
    setActiveAction(actionKey);
    setError(null);
    setSuccess(null);

    try {
      if (action === 'approve') {
        await approveUser(accessToken, user.id);
        setSuccess(`${user.email} aprovado.`);
      }

      if (action === 'block') {
        await blockUser(accessToken, user.id);
        setSuccess(`${user.email} bloqueado.`);
      }

      if (action === 'unblock') {
        await unblockUser(accessToken, user.id);
        setSuccess(`${user.email} desbloqueado.`);
      }

      await loadUsers(accessToken, page, filters);
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Nao foi possivel concluir a acao.');
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-[#f1e7dc] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-bold text-brand-600">EntregGO</p>
            <h1 className="text-3xl font-black text-asphalt-950">Painel Admin</h1>
            <p className="max-w-2xl text-sm leading-6 text-gray-600">
              Cadastros, aprovacoes e bloqueios operacionais.
            </p>
          </div>
          {authContext ? (
            <div className="flex items-center gap-2 rounded-md border border-[#f1e7dc] bg-white px-3 py-2 text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>{authContext.user.email}</span>
              <StatusBadge status={authContext.user.status} />
            </div>
          ) : null}
        </header>

        {isBooting ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando painel
          </div>
        ) : null}

        {!isBooting && !canManage ? (
          <div className="space-y-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4" />
              Acesso administrativo indisponivel
            </div>
            {error ? <p>{error}</p> : null}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 transition hover:border-red-400"
              href="/login"
            >
              Voltar ao login
            </Link>
          </div>
        ) : null}

        {canManage ? (
          <>
            <form
              className="grid gap-3 border-b border-[#f1e7dc] pb-5 md:grid-cols-[1fr_160px_160px_auto]"
              onSubmit={handleFilterSubmit}
            >
              <label className="block space-y-2 text-sm font-medium text-gray-800">
                <span>Buscar email</span>
                <input
                  className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, search: event.target.value }))
                  }
                  type="search"
                  value={filters.search}
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-gray-800">
                <span>Perfil</span>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      role: event.target.value as Filters['role'],
                    }))
                  }
                  value={filters.role}
                >
                  <option value="">Todos</option>
                  <option value="admin">Admin</option>
                  <option value="logista">Loja</option>
                  <option value="motoboy">Motoboy</option>
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium text-gray-800">
                <span>Status</span>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value as Filters['status'],
                    }))
                  }
                  value={filters.status}
                >
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="ativo">Ativo</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </label>

              <button
                className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={isLoadingUsers}
                type="submit"
              >
                {isLoadingUsers ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Atualizar
              </button>
            </form>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-md border border-[#f1e7dc] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                  <thead className="bg-[#fffaf4] text-xs uppercase tracking-wide text-gray-600">
                    <tr>
                      <th className="border-b border-[#f1e7dc] px-4 py-3">Email</th>
                      <th className="border-b border-[#f1e7dc] px-4 py-3">Perfil</th>
                      <th className="border-b border-[#f1e7dc] px-4 py-3">Status</th>
                      <th className="border-b border-[#f1e7dc] px-4 py-3">Criado em</th>
                      <th className="border-b border-[#f1e7dc] px-4 py-3">Aprovado em</th>
                      <th className="border-b border-[#f1e7dc] px-4 py-3 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.items.map((user) => (
                      <tr className="border-b border-[#f1e7dc] last:border-b-0" key={user.id}>
                        <td className="px-4 py-3 font-medium text-gray-950">{user.email}</td>
                        <td className="px-4 py-3 text-gray-700">{roleLabels[user.role]}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(user.approved_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {getAvailableActions(user, authContext?.user.id).map((action) => {
                              const actionKey = `${action}:${user.id}`;
                              const isBusy = activeAction === actionKey;

                              if (action === 'approve') {
                                return (
                                  <button
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-emerald-300 px-3 text-xs font-semibold text-emerald-800 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={Boolean(activeAction)}
                                    key={action}
                                    onClick={() => void handleAction(user, action)}
                                    type="button"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                    Aprovar
                                  </button>
                                );
                              }

                              if (action === 'unblock') {
                                return (
                                  <button
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-300 px-3 text-xs font-semibold text-blue-800 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={Boolean(activeAction)}
                                    key={action}
                                    onClick={() => void handleAction(user, action)}
                                    type="button"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Unlock className="h-3.5 w-3.5" />
                                    )}
                                    Desbloquear
                                  </button>
                                );
                              }

                              return (
                                <button
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-300 px-3 text-xs font-semibold text-red-800 transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(activeAction)}
                                  key={action}
                                  onClick={() => void handleAction(user, action)}
                                  type="button"
                                >
                                  {isBusy ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}
                                  Bloquear
                                </button>
                              );
                            })}
                            {user.id === authContext?.user.id ? (
                              <span className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 px-3 text-xs font-semibold text-gray-500">
                                Sessao atual
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isLoadingUsers && users?.items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-600">
                  Nenhum usuario encontrado.
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-[#f1e7dc] px-4 py-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {users?.pagination.total ?? 0} usuarios encontrados / pagina {page} de{' '}
                  {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 font-semibold transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page <= 1 || isLoadingUsers}
                    onClick={() => void handlePageChange(page - 1)}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 font-semibold transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page >= totalPages || isLoadingUsers}
                    onClick={() => void handlePageChange(page + 1)}
                    type="button"
                  >
                    Proxima
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
