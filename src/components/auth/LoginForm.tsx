'use client';

import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { getMe, ClientApiError } from '@/lib/api';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { AuthContext } from '@/types/auth';

type FormState = {
  email: string;
  password: string;
};

const initialState: FormState = {
  email: '',
  password: '',
};

function getDestination(authContext: AuthContext) {
  if (authContext.user.status !== 'ativo') {
    return `/aguardando-aprovacao?status=${authContext.user.status}`;
  }

  if (authContext.user.role === 'admin') {
    return '/admin';
  }

  if (authContext.user.role === 'logista') {
    return '/loja';
  }

  return '/motoboy';
}

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError || !data.session?.access_token) {
        setError('Email ou senha invalidos.');
        return;
      }

      const authContext = await getMe(data.session.access_token);
      router.push(getDestination(authContext));
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Nao foi possivel entrar agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-950">Entrar</h2>
        <p className="text-sm text-gray-600">Use a conta aprovada no EntregGO.</p>
      </div>

      <label className="block space-y-2 text-sm font-medium text-gray-800">
        <span>Email</span>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
          type="email"
          value={form.email}
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-gray-800">
        <span>Senha</span>
        <input
          autoComplete="current-password"
          className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
          minLength={8}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
          type="password"
          value={form.password}
        />
      </label>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Entrar
      </button>
    </form>
  );
}
