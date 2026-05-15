'use client';

import { Bike, CheckCircle2, Loader2, Store } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { ClientApiError, registerCourier, registerStore } from '@/lib/api';

type RegistrationKind = 'store' | 'courier';

type FormState = {
  kind: RegistrationKind;
  email: string;
  password: string;
  storeName: string;
  ownerName: string;
  address: string;
  description: string;
  fullName: string;
};

const initialState: FormState = {
  kind: 'store',
  email: '',
  password: '',
  storeName: '',
  ownerName: '',
  address: '',
  description: '',
  fullName: '',
};

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (form.kind === 'store') {
        await registerStore({
          email: form.email,
          password: form.password,
          store: {
            name: form.storeName,
            ownerName: form.ownerName,
            address: form.address,
            description: form.description || undefined,
          },
        });
      } else {
        await registerCourier({
          email: form.email,
          password: form.password,
          courier: {
            fullName: form.fullName,
          },
        });
      }

      setSuccessMessage('Cadastro recebido. Aguarde aprovacao do admin.');
      setForm(initialState);
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Nao foi possivel enviar o cadastro agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de cadastro">
        <button
          aria-checked={form.kind === 'store'}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition ${
            form.kind === 'store'
              ? 'border-brand-500 bg-brand-50 text-brand-600'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
          onClick={() => setForm((current) => ({ ...current, kind: 'store' }))}
          role="radio"
          type="button"
        >
          <Store className="h-4 w-4" />
          Loja
        </button>
        <button
          aria-checked={form.kind === 'courier'}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition ${
            form.kind === 'courier'
              ? 'border-brand-500 bg-brand-50 text-brand-600'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
          onClick={() => setForm((current) => ({ ...current, kind: 'courier' }))}
          role="radio"
          type="button"
        >
          <Bike className="h-4 w-4" />
          Motoboy
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            autoComplete="new-password"
            className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
            minLength={8}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
            type="password"
            value={form.password}
          />
        </label>
      </div>

      {form.kind === 'store' ? (
        <div className="grid gap-4">
          <label className="block space-y-2 text-sm font-medium text-gray-800">
            <span>Nome da loja</span>
            <input
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
              onChange={(event) =>
                setForm((current) => ({ ...current, storeName: event.target.value }))
              }
              required
              type="text"
              value={form.storeName}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-gray-800">
              <span>Responsavel</span>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                onChange={(event) =>
                  setForm((current) => ({ ...current, ownerName: event.target.value }))
                }
                required
                type="text"
                value={form.ownerName}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-gray-800">
              <span>Endereco</span>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                onChange={(event) =>
                  setForm((current) => ({ ...current, address: event.target.value }))
                }
                required
                type="text"
                value={form.address}
              />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium text-gray-800">
            <span>Descricao</span>
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
              maxLength={500}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              value={form.description}
            />
          </label>
        </div>
      ) : (
        <label className="block space-y-2 text-sm font-medium text-gray-800">
          <span>Nome completo</span>
          <input
            className="h-11 w-full rounded-md border border-gray-300 px-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            required
            type="text"
            value={form.fullName}
          />
        </label>
      )}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-start gap-2 rounded-md border border-brand-500 bg-brand-50 px-3 py-2 text-sm text-brand-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
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
          <CheckCircle2 className="h-4 w-4" />
        )}
        Enviar cadastro
      </button>

      <p className="text-center text-sm text-gray-600">
        Ja tem conta?{' '}
        <Link className="font-semibold text-brand-600" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
