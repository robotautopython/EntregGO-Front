'use client';

import {
  Ban,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Lock,
  Mail,
  PackageOpen,
  ShieldCheck,
  Unlock,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type {
  AdminCourierProfile,
  AdminStoreProfile,
  AdminUserDetail,
  DomainUser,
  UserRole,
  UserStatus,
} from '@/types/auth';

interface UserDetailDrawerProps {
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

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
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
          {tab === 'entregas' ? <EntregasTab /> : null}
          {tab === 'pagamento' ? <PagamentoTab /> : null}
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

function EntregasTab() {
  return (
    <div className="space-y-4">
      <Card variant="paper" className="border-dashed">
        <Lock className="h-5 w-5 text-asphalt-950/50" aria-hidden="true" />
        <p className="mt-2 text-sm font-bold text-asphalt-950">
          Histórico por usuário ainda não disponível
        </p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          Vai listar as últimas entregas relacionadas a este usuário — solicitadas (se loja) ou
          aceitas (se motoboy). Performance Validator precisa avaliar paginação e índices antes
          desta aba ser ligada.
        </p>
      </Card>
      <Card variant="paper" className="border-dashed">
        <p className="text-xs text-asphalt-950/65">
          Endpoint necessário:{' '}
          <code className="font-mono text-asphalt-950">
            GET /api/admin/users/:id/deliveries?page=1
          </code>
        </p>
      </Card>
    </div>
  );
}

function PagamentoTab() {
  return (
    <div className="space-y-4">
      <Card variant="paper" className="border-dashed">
        <Wallet className="h-5 w-5 text-asphalt-950/50" aria-hidden="true" />
        <p className="mt-2 text-sm font-bold text-asphalt-950">
          Controle de pagamento aguardando endpoint
        </p>
        <p className="mt-1 text-xs text-asphalt-950/65">
          Tabela <code className="font-mono text-asphalt-950">public.payments</code> já existe na
          M-01, mas controllers/routes de pagamento ainda não foram implementados no backend.
          Marcar como pago precisa de auditoria de quem marcou e idempotência server-side.
        </p>
      </Card>
      <Card variant="paper" className="border-dashed">
        <p className="text-xs text-asphalt-950/65">
          Endpoints necessários:{' '}
          <code className="font-mono text-asphalt-950">
            GET /api/admin/payments?user_id=...
          </code>{' '}
          +{' '}
          <code className="font-mono text-asphalt-950">
            PATCH /api/admin/payments/:id/mark-paid
          </code>
        </p>
      </Card>
    </div>
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
