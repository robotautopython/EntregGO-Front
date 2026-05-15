'use client';

import {
  Bell,
  Bike,
  History,
  MapPin,
  Power,
  Settings,
  TimerReset,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { AuthContext } from '@/types/auth';

interface MotoboyHomeProps {
  authContext: AuthContext;
}

export function MotoboyHome({ authContext }: MotoboyHomeProps) {
  const [online, setOnline] = useState(false);
  const name = authContext.user.email.split('@')[0];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sua rua, sua moto"
        title={`Olá, ${name}.`}
        description="Fique online quando estiver disponível. A central só te chama quando tiver corrida."
      />

      <Card
        variant={online ? 'white' : 'paper'}
        className={cn(
          'transition-colors duration-ride ease-ride',
          online ? 'border-brand-300 bg-brand-50' : '',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-md text-white shadow-pop',
                online ? 'bg-brand-500' : 'bg-asphalt-950',
              )}
            >
              <Bike className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-asphalt-950/55">
                Status atual
              </p>
              <p className="text-2xl font-black text-asphalt-950">
                {online ? 'Online · pronto para corridas' : 'Offline · ninguém te vê'}
              </p>
              <p className="mt-1 text-sm text-asphalt-950/70">
                {online
                  ? 'A central avisa por push quando uma loja chamar.'
                  : 'Toque para ficar visível e receber notificações.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOnline((value) => !value)}
            className={cn(
              'inline-flex h-14 items-center justify-center gap-2 rounded-md px-6 text-base font-extrabold transition-all duration-ride ease-ride sm:min-w-44',
              online
                ? 'bg-asphalt-950 text-white shadow-ink hover:bg-asphalt-700'
                : 'bg-brand-500 text-white shadow-pop hover:bg-brand-600',
            )}
          >
            <Power className="h-5 w-5" aria-hidden="true" />
            {online ? 'Ficar offline' : 'Ficar online'}
          </button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card variant="white">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
            Hoje
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
            0
          </p>
          <p className="text-xs text-asphalt-950/60">corridas</p>
        </Card>
        <Card variant="white">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-route-600">
            Semana
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
            0
          </p>
          <p className="text-xs text-asphalt-950/60">corridas</p>
        </Card>
        <Card variant="white">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Tempo médio
          </p>
          <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
            —
          </p>
          <p className="text-xs text-asphalt-950/60">por entrega</p>
        </Card>
      </div>

      <section aria-labelledby="solicitacoes-titulo" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="solicitacoes-titulo" className="text-lg font-black text-asphalt-950">
            Solicitações disponíveis
          </h2>
          {online ? (
            <Badge tone="brand" pulsing>
              Escutando
            </Badge>
          ) : (
            <Badge tone="paper">Pausado</Badge>
          )}
        </div>

        {online ? (
          <Card variant="white" className="text-center">
            <div className="flex flex-col items-center gap-3 py-6">
              <BoxMark size={96} tone="color" />
              <p className="text-base font-extrabold text-asphalt-950">
                Pronto. Quando uma loja chamar, aparece aqui.
              </p>
              <p className="max-w-md text-sm text-asphalt-950/65">
                A notificação push toca com som e vibração. Toque em <strong>Aceitar</strong> pra
                fechar a corrida — o primeiro toque vence.
              </p>
            </div>
          </Card>
        ) : (
          <Card variant="paper" className="text-center">
            <div className="flex flex-col items-center gap-3 py-6">
              <BoxMark size={96} tone="paper" />
              <p className="text-base font-extrabold text-asphalt-950">
                Você está offline.
              </p>
              <p className="max-w-md text-sm text-asphalt-950/65">
                Ative o status acima para começar a receber chamados da central.
              </p>
            </div>
          </Card>
        )}
      </section>

      <Alert tone="info" title="Notificações push">
        <p className="leading-6">
          Para receber corridas com som e vibração, autorize as notificações no seu navegador.
          Recomendamos instalar o EntregGO como app no celular.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-route-500 px-4 text-sm font-extrabold text-white hover:bg-route-600"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            Ativar notificações
          </button>
          <Link
            href="#"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-route-200 bg-white px-4 text-sm font-bold text-route-700 hover:border-route-500"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Instalar como app
          </Link>
        </div>
      </Alert>

      <Card variant="white" className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/motoboy/historico"
          className="flex items-center justify-between gap-3 rounded-md bg-paper p-4 transition-colors hover:bg-paper-deep"
        >
          <span className="flex items-center gap-3">
            <History className="h-5 w-5 text-route-600" aria-hidden="true" />
            <span className="text-sm font-extrabold text-asphalt-950">Histórico de corridas</span>
          </span>
          <TimerReset className="h-4 w-4 text-asphalt-950/45" aria-hidden="true" />
        </Link>
        <Link
          href="/motoboy/perfil"
          className="flex items-center justify-between gap-3 rounded-md bg-paper p-4 transition-colors hover:bg-paper-deep"
        >
          <span className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <span className="text-sm font-extrabold text-asphalt-950">Meu perfil</span>
          </span>
          <TimerReset className="h-4 w-4 text-asphalt-950/45" aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}
