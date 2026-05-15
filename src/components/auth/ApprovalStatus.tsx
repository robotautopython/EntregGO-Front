'use client';

import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ClientApiError, getMe } from '@/lib/api';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { AuthContext } from '@/types/auth';

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
        setAuthContext(me);
      } catch (caughtError) {
        if (caughtError instanceof ClientApiError) {
          setError(caughtError.message);
          return;
        }

        setError('Nao foi possivel carregar a sessao.');
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

  const status = authContext?.user.status ?? searchParams.get('status') ?? 'pendente';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-950">Status da conta</h2>
          <p className="text-sm text-gray-600">Status atual: {status}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando sessao
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {authContext ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p>Perfil: {authContext.user.role}</p>
          <p>Status: {authContext.user.status}</p>
        </div>
      ) : !isLoading ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Sessao local nao encontrada.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400"
          href="/login"
        >
          Login
        </Link>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          onClick={handleSignOut}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
