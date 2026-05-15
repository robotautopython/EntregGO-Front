'use client';

import { Check, Clock3, Loader2, LogOut, ShieldOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BoxMark } from '@/components/brand/BoxMark';
import { ClientApiError, getMe } from '@/lib/api';
import { cn } from '@/lib/cn';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { AuthContext, UserStatus } from '@/types/auth';

type DisplayStatus = UserStatus | 'desconhecido';

const statusCopy: Record<
  DisplayStatus,
  {
    eyebrow: string;
    title: string;
    description: string;
    tone: 'brand' | 'success' | 'danger' | 'paper';
    badge: 'brand' | 'success' | 'danger' | 'paper';
  }
> = {
  pendente: {
    eyebrow: 'Em análise',
    title: 'Recebemos seu cadastro.',
    description:
      'A central confere os dados e libera o acesso. Você recebe um aviso por email quando estiver tudo certo.',
    tone: 'brand',
    badge: 'brand',
  },
  ativo: {
    eyebrow: 'Acesso liberado',
    title: 'Tudo certo — bem-vindo à central.',
    description: 'Seu acesso já está ativo. Entre no painel quando quiser começar.',
    tone: 'success',
    badge: 'success',
  },
  bloqueado: {
    eyebrow: 'Acesso suspenso',
    title: 'Seu acesso está suspenso.',
    description:
      'Em algum momento a central pausou seu acesso. Entre em contato para entender o motivo e voltar a operar.',
    tone: 'danger',
    badge: 'danger',
  },
  desconhecido: {
    eyebrow: 'Sessão não encontrada',
    title: 'Não conseguimos identificar sua sessão.',
    description: 'Faça login novamente para conferir o status da sua conta.',
    tone: 'paper',
    badge: 'paper',
  },
};

const steps = [
  { key: 'sent', label: 'Cadastro enviado', icon: Check },
  { key: 'review', label: 'Em análise', icon: Clock3 },
  { key: 'live', label: 'Acesso liberado', icon: Sparkles },
];

function stepStateFor(status: DisplayStatus): {
  active: number;
  pulsing: number | null;
  failed: boolean;
} {
  switch (status) {
    case 'pendente':
      return { active: 1, pulsing: 1, failed: false };
    case 'ativo':
      return { active: 2, pulsing: null, failed: false };
    case 'bloqueado':
      return { active: 1, pulsing: null, failed: true };
    default:
      return { active: 0, pulsing: null, failed: false };
  }
}

export function ApprovalStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();

        if (!data.session?.access_token) {
          setIsLoading(false);
          return;
        }

        const me = await getMe(data.session.access_token);
        setAuthContext(me ?? null);
      } catch (caughtError) {
        if (caughtError instanceof ClientApiError) {
          setError(caughtError.message);
          return;
        }

        setError('Não foi possível carregar a sessão.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadSession();
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const rawStatus =
    authContext?.user.status ??
    (searchParams.get('status') as UserStatus | null) ??
    (authContext ? 'pendente' : 'desconhecido');

  const status: DisplayStatus =
    rawStatus === 'pendente' ||
    rawStatus === 'ativo' ||
    rawStatus === 'bloqueado'
      ? rawStatus
      : 'desconhecido';

  const copy = statusCopy[status];
  const { active, pulsing, failed } = stepStateFor(status);

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4">
        <div className="hidden sm:block">
          <BoxMark size={84} tone={status === 'bloqueado' ? 'mono' : 'color'} />
        </div>
        <div className="space-y-2">
          <Badge tone={copy.badge} pulsing={status === 'pendente'}>
            {copy.eyebrow}
          </Badge>
          <h2 className="text-xl font-black text-asphalt-950 sm:text-2xl">{copy.title}</h2>
          <p className="text-sm leading-6 text-asphalt-950/70">{copy.description}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="inline-flex items-center gap-2 rounded-md border border-paper-line bg-paper px-3 py-2 text-sm font-semibold text-asphalt-950/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando sessão...
        </div>
      ) : null}

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <ol className="grid gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < active || (status === 'ativo' && index <= active);
          const isCurrent = index === active && !failed;
          const isPulsing = pulsing === index;
          const isFailed = failed && index === active;

          return (
            <li
              key={step.key}
              className={cn(
                'flex items-center gap-3 rounded-md border px-4 py-3',
                isFailed
                  ? 'border-danger-500/30 bg-danger-50 text-danger-700'
                  : isCompleted
                    ? 'border-success-500/30 bg-success-50 text-success-700'
                    : isCurrent
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-paper-line bg-paper text-asphalt-950/60',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  isFailed
                    ? 'bg-danger-500 text-white'
                    : isCompleted
                      ? 'bg-success-500 text-white'
                      : isCurrent
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-asphalt-950/40 border border-paper-line',
                  isPulsing && 'animate-pulse-soft',
                )}
              >
                {isFailed ? (
                  <ShieldOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="text-sm font-extrabold">{step.label}</span>
              {isCurrent && status === 'pendente' && (
                <span className="ml-auto text-xs font-bold uppercase tracking-widest text-brand-700">
                  agora
                </span>
              )}
              {isCompleted && status === 'ativo' && index === active && (
                <span className="ml-auto text-xs font-bold uppercase tracking-widest text-success-700">
                  pronto
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {authContext ? (
        <div className="rounded-md border border-paper-line bg-paper p-4 text-xs text-asphalt-950/70">
          <p className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-widest text-asphalt-950/55">
              Perfil
            </span>
            <span className="font-mono font-bold text-asphalt-950">
              {authContext.user.role}
            </span>
          </p>
          <p className="mt-1.5 flex items-center justify-between">
            <span className="font-bold uppercase tracking-widest text-asphalt-950/55">
              Status
            </span>
            <span className="font-mono font-bold text-asphalt-950">
              {authContext.user.status}
            </span>
          </p>
        </div>
      ) : !isLoading ? (
        <Alert tone="info">
          Você não está autenticado agora. Faça login para conferir seu status atualizado.
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {status === 'ativo' && authContext ? (
          <Link
            href={
              authContext.user.role === 'admin'
                ? '/admin/usuarios'
                : authContext.user.role === 'logista'
                  ? '/loja'
                  : '/motoboy'
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-500 px-5 text-sm font-extrabold text-white shadow-pop transition hover:bg-brand-600"
          >
            Ir para meu painel
          </Link>
        ) : null}
        {status === 'bloqueado' ? (
          <a
            href="mailto:suporte@ent.app.br"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-asphalt-950 px-5 text-sm font-extrabold text-white shadow-ink transition hover:bg-asphalt-700"
          >
            Falar com a central
          </a>
        ) : null}
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md border border-paper-line bg-white px-5 text-sm font-extrabold text-asphalt-950 transition hover:border-brand-300"
        >
          Fazer login
        </Link>
        {authContext ? (
          <Button onClick={handleSignOut} variant="ghost" size="md">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </Button>
        ) : null}
      </div>
    </div>
  );
}
