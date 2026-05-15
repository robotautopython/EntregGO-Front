'use client';

import { AlertTriangle, Loader2, ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { BoxMark } from '@/components/brand/BoxMark';
import { useAuthSession } from '@/hooks/useAuthSession';
import { cn } from '@/lib/cn';
import type { AuthContext, UserRole } from '@/types/auth';

import { MobileNavDrawer } from './MobileNavDrawer';
import { ShellBottomNav } from './ShellBottomNav';
import { ShellSidebar } from './ShellSidebar';
import { ShellTopbar } from './ShellTopbar';

interface OperationalShellProps {
  role: UserRole;
  title?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  children: ReactNode | ((ctx: AuthShellRenderContext) => ReactNode);
}

export interface AuthShellRenderContext {
  authContext: AuthContext;
  accessToken: string;
}

export function OperationalShell({
  role,
  title,
  searchPlaceholder,
  showSearch,
  children,
}: OperationalShellProps) {
  const router = useRouter();
  const { authContext, accessToken, isLoading, error, signOut } = useAuthSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('entreggo:sidebar-collapsed');
    if (saved === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('entreggo:sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const accessIssue = useMemo<
    null | { tone: 'pending' | 'blocked' | 'wrongRole' | 'unauth'; message: string }
  >(() => {
    if (isLoading) return null;
    if (!authContext) return { tone: 'unauth', message: 'Sessão não encontrada.' };
    if (authContext.user.status === 'pendente')
      return {
        tone: 'pending',
        message: 'Seu cadastro ainda aguarda aprovação da central.',
      };
    if (authContext.user.status === 'bloqueado')
      return { tone: 'blocked', message: 'Sua conta foi suspensa pela central.' };
    if (authContext.user.role !== role)
      return {
        tone: 'wrongRole',
        message: `Esta área é para ${role}. Seu perfil é ${authContext.user.role}.`,
      };
    return null;
  }, [authContext, isLoading, role]);

  const ready = !isLoading && authContext && accessToken && !accessIssue;

  return (
    <div className="flex min-h-screen bg-paper text-asphalt-950">
      <ShellSidebar
        role={role}
        authContext={authContext}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onSignOut={signOut}
      />

      <MobileNavDrawer
        role={role}
        authContext={authContext}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSignOut={signOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopbar
          role={role}
          authContext={authContext}
          title={title}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          onOpenMobileNav={() => setMobileOpen(true)}
          onSignOut={signOut}
        />

        <main className={cn('flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8')}>
          {isLoading ? (
            <ShellLoading />
          ) : error ? (
            <Alert tone="danger" title="Não conseguimos validar sua sessão">
              {error}
              <div className="mt-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-asphalt-950 px-4 text-sm font-extrabold text-white hover:bg-asphalt-700"
                >
                  Voltar para o login
                </Link>
              </div>
            </Alert>
          ) : accessIssue ? (
            <AccessIssue
              tone={accessIssue.tone}
              message={accessIssue.message}
              onSignOut={signOut}
              onGoToStatus={() => router.push('/aguardando-aprovacao')}
            />
          ) : ready ? (
            typeof children === 'function'
              ? children({ authContext, accessToken })
              : children
          ) : null}
        </main>

        <ShellBottomNav role={role} />
      </div>
    </div>
  );
}

function ShellLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-asphalt-950/70">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm font-semibold">Carregando central...</p>
    </div>
  );
}

interface AccessIssueProps {
  tone: 'pending' | 'blocked' | 'wrongRole' | 'unauth';
  message: string;
  onSignOut: () => void;
  onGoToStatus: () => void;
}

function AccessIssue({ tone, message, onSignOut, onGoToStatus }: AccessIssueProps) {
  const variants = {
    pending: {
      title: 'Aguardando aprovação',
      icon: AlertTriangle,
      color: 'border-warn-500/30 bg-warn-50 text-warn-700',
    },
    blocked: {
      title: 'Acesso suspenso',
      icon: ShieldOff,
      color: 'border-danger-500/30 bg-danger-50 text-danger-700',
    },
    wrongRole: {
      title: 'Área incorreta',
      icon: ShieldOff,
      color: 'border-route-200 bg-route-50 text-route-700',
    },
    unauth: {
      title: 'Sessão não encontrada',
      icon: ShieldOff,
      color: 'border-paper-line bg-white text-asphalt-950',
    },
  } as const;

  const v = variants[tone];
  const Icon = v.icon;

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8">
      <div className={`flex items-start gap-4 rounded-lg border p-6 ${v.color}`}>
        <div className="hidden sm:block">
          <BoxMark size={84} tone={tone === 'blocked' ? 'mono' : 'color'} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" aria-hidden="true" />
            <h3 className="text-lg font-black">{v.title}</h3>
          </div>
          <p className="text-sm font-medium leading-6">{message}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onGoToStatus}
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-extrabold text-white shadow-pop hover:bg-brand-600"
            >
              Ver status do meu cadastro
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex h-10 items-center justify-center rounded-md border border-paper-line bg-white px-4 text-sm font-bold text-asphalt-950 hover:border-brand-300"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
