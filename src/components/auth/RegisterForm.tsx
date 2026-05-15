'use client';

import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { cn } from '@/lib/cn';
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

const tabs: Array<{ kind: RegistrationKind; label: string; icon: typeof Store }> = [
  { kind: 'store', label: 'Loja', icon: Store },
  { kind: 'courier', label: 'Motoboy', icon: Bike },
];

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Uploads captured client-side for future multipart submission.
  // API atual aceita apenas JSON; documentos serão recebidos após aprovação via perfil.
  const [, setLogoFile] = useState<File | null>(null);
  const [, setBikeFile] = useState<File | null>(null);
  const [, setLicenseFile] = useState<File | null>(null);

  useEffect(() => {
    const role = searchParams.get('papel');
    if (role === 'motoboy') {
      setForm((current) => ({ ...current, kind: 'courier' }));
    } else if (role === 'loja') {
      setForm((current) => ({ ...current, kind: 'store' }));
    }
  }, [searchParams]);

  function switchKind(kind: RegistrationKind) {
    setForm((current) => ({ ...current, kind }));
    setError(null);
    setSuccessMessage(null);
  }

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

      setSuccessMessage('Cadastro recebido. A central vai conferir e liberar seu acesso.');
      setForm({ ...initialState, kind: form.kind });
    } catch (caughtError) {
      if (caughtError instanceof ClientApiError) {
        setError(caughtError.message);
        return;
      }

      setError('Não foi possível enviar o cadastro agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div
        className="relative grid grid-cols-2 gap-1 rounded-md border border-paper-line bg-paper p-1"
        role="tablist"
        aria-label="Tipo de cadastro"
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-md bg-brand-500 shadow-pop transition-transform duration-ride ease-ride',
            form.kind === 'courier' ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0',
          )}
        />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = form.kind === tab.kind;
          return (
            <button
              key={tab.kind}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => switchKind(tab.kind)}
              className={cn(
                'relative z-10 inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-extrabold transition-colors duration-ui ease-ride',
                isActive ? 'text-white' : 'text-asphalt-950/65 hover:text-asphalt-950',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
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
          <PasswordStrength value={form.password} className="pt-2" />
        </Field>
      </div>

      {form.kind === 'store' ? (
        <div className="grid gap-4">
          <Field label="Nome da loja" required>
            <Input
              required
              placeholder="Ex: Açaí da Esquina"
              value={form.storeName}
              onChange={(event) =>
                setForm((current) => ({ ...current, storeName: event.target.value }))
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Responsável" required>
              <Input
                required
                placeholder="Nome do dono"
                value={form.ownerName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ownerName: event.target.value }))
                }
              />
            </Field>
            <Field label="Endereço da loja" required>
              <Input
                required
                placeholder="Rua, número, bairro"
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address: event.target.value }))
                }
              />
            </Field>
          </div>

          <Field
            label="Descrição"
            hint="Aparece pros motoboys junto com a logo. Máx 500 caracteres."
          >
            <Textarea
              maxLength={500}
              rows={3}
              placeholder="O que sua loja faz?"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>

          <UploadDropzone
            label="Logo da loja"
            hint="A logo aparece pros motoboys. Você pode enviar depois também."
            shape="square"
            onChange={setLogoFile}
            className="sm:max-w-sm"
          />
        </div>
      ) : (
        <div className="grid gap-4">
          <Field label="Nome completo" required>
            <Input
              required
              placeholder="Como aparece na CNH"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <UploadDropzone
              label="Foto da moto"
              hint="A central confere antes de aprovar."
              shape="wide"
              onChange={setBikeFile}
            />
            <UploadDropzone
              label="Foto da CNH"
              hint="Documento legível, com nome visível."
              shape="wide"
              onChange={setLicenseFile}
            />
          </div>
        </div>
      )}

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {successMessage ? (
        <Alert tone="success" title="Cadastro enviado">
          {successMessage}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          width="full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSubmitting ? 'Enviando cadastro...' : 'Enviar cadastro'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>

        <p className="text-center text-xs text-asphalt-950/60">
          Ao continuar, você concorda em ter sua conta revisada pela central antes de operar.
        </p>
      </div>

      <p className="border-t border-paper-line pt-4 text-center text-sm">
        Já tem conta?{' '}
        <Link
          className="font-extrabold text-brand-700 underline-offset-4 hover:underline"
          href="/login"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
