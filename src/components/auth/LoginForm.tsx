'use client';

import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ClientApiError, getMe } from '@/lib/api';
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
  const [showPassword, setShowPassword] = useState(false);

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
        setError('Email ou senha inválidos.');
        return;
      }

      const authContext = await getMe(data.session.access_token);
      router.push(getDestination(authContext));
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Não foi possível entrar agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <Field label="Email" required>
        <Input
          autoComplete="email"
          type="email"
          required
          placeholder="voce@email.com"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
      </Field>

      <Field label="Senha" required>
        <div className="relative">
          <Input
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder="••••••••"
            className="pr-12"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-asphalt-950/60 hover:bg-paper-deep hover:text-asphalt-950"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </Field>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <Button type="submit" variant="primary" size="lg" width="full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {isSubmitting ? 'Entrando...' : 'Entrar na central'}
      </Button>

      <div className="space-y-2 pt-2 text-center text-sm">
        <p className="text-asphalt-950/70">
          Ainda não tem conta?{' '}
          <Link href="/registro" className="font-extrabold text-brand-700 underline-offset-4 hover:underline">
            Fazer cadastro
          </Link>
        </p>
        <p className="text-xs text-asphalt-950/55">
          Esqueceu a senha? Fale com a central em{' '}
          <a href="mailto:suporte@ent.app.br" className="font-bold underline">
            suporte@ent.app.br
          </a>
          .
        </p>
      </div>
    </form>
  );
}
