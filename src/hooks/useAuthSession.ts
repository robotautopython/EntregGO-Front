'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ClientApiError, getMe } from '@/lib/api';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { AuthContext } from '@/types/auth';

export type SessionState = {
  authContext: AuthContext | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useAuthSession(): SessionState {
  const router = useRouter();
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;

      if (!token) {
        setAccessToken(null);
        setAuthContext(null);
        return;
      }

      const me = await getMe(token);
      setAccessToken(token);
      setAuthContext(me ?? null);
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Não foi possível carregar sua sessão.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signOut = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setAccessToken(null);
    setAuthContext(null);
    router.push('/login');
  }, [router]);

  return {
    authContext,
    accessToken,
    isLoading,
    error,
    signOut,
    refresh: load,
  };
}
