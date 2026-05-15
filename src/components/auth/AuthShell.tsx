'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  variant?: 'register' | 'login' | 'status';
}

const taglines: Record<NonNullable<AuthShellProps['variant']>, string[]> = {
  register: [
    'Central de entregas, não app de marketing.',
    'Aprovação real, dados protegidos.',
    'Sua loja na rua em uma decisão.',
  ],
  login: [
    'Energia de rua, controle de central.',
    'Pedido sai. Motoboy assume. Cliente recebe.',
    'Primeiro aceite vence — sem leilão.',
  ],
  status: [
    'Nossa central confere antes da rua.',
    'Aprovação manual mantém a rede limpa.',
    'A próxima atualização vem por email.',
  ],
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  variant = 'login',
}: AuthShellProps) {
  const lines = taglines[variant];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;
    const id = setInterval(() => {
      setActive((value) => (value + 1) % lines.length);
    }, 4200);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <main className="min-h-screen bg-paper text-asphalt-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-asphalt-950 px-10 py-10 text-white lg:flex">
          <div
            aria-hidden="true"
            className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-route-500/20 blur-3xl"
          />

          <Link href="/" aria-label="Voltar para a landing" className="relative z-10 inline-flex items-center gap-2 text-sm font-bold text-white/80 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar à landing
          </Link>

          <div className="relative z-10 space-y-10">
            <Link href="/" className="inline-flex" aria-label="EntregGO inicio">
              <Image
                alt="EntregGO"
                src="/brand/entreggo-logo-on-dark.png"
                width={1731}
                height={908}
                priority
                className="h-11 w-auto"
              />
            </Link>

            <div className="space-y-6">
              <BoxMark size={140} className="animate-bob" />
              <div className="relative h-20 max-w-md overflow-hidden">
                {lines.map((line, index) => (
                  <p
                    key={line}
                    className={`absolute inset-0 text-2xl font-black leading-tight transition-all duration-ride ease-ride ${
                      index === active
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-4 opacity-0'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/45">
            <span>© EntregGO</span>
            <span>v0.1 · build edge</span>
          </div>
        </aside>

        <section className="flex flex-col px-5 py-8 sm:px-10 sm:py-12 lg:py-16">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="EntregGO inicio" className="inline-flex">
              <Image
                alt="EntregGO"
                src="/brand/entreggo-logo-transparent.png"
                width={1731}
                height={908}
                priority
                className="h-9 w-auto"
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-asphalt-950/70 hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Início
            </Link>
          </div>

          <div className="mx-auto w-full max-w-xl flex-1">
            <div className="space-y-2">
              {eyebrow ? (
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-3xl font-black leading-tight text-asphalt-950 sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-lg text-base leading-7 text-asphalt-950/70">{subtitle}</p>
            </div>

            <div className="mt-8 rounded-lg border border-paper-line bg-white p-6 shadow-card sm:p-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
