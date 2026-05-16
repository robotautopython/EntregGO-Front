'use client';

import { Bell, BellOff, Bike, Inbox, Power, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { AuthContext } from '@/types/auth';

import { CorridaAtiva } from './CorridaAtiva';
import {
  type ActiveRide,
  type IncomingRequest,
  type RideStatus,
  sampleStores,
} from './courier-types';
import { FilaDisponivel } from './FilaDisponivel';
import { PushPrimeSheet } from './PushPrimeSheet';
import { SolicitacaoCard } from './SolicitacaoCard';

interface CourierHomeFlowProps {
  authContext: AuthContext;
  accessToken: string;
}

interface CourierDemoFlowProps {
  authContext: AuthContext;
}

export function CourierHomeFlow({ authContext, accessToken }: CourierHomeFlowProps) {
  const searchParams = useSearchParams();
  const demo = searchParams.get('demo');
  const demoMode = demo === 'ativo' || demo === 'solicitacao';

  if (demoMode) {
    return <CourierDemoFlow authContext={authContext} />;
  }

  return <FilaDisponivel accessToken={accessToken} />;
}

function newRequest(index: number, fingerprint: string): IncomingRequest {
  const template = sampleStores[index % sampleStores.length];
  if (!template) {
    throw new Error('Sample store template missing');
  }
  return {
    id: `req-${fingerprint}`,
    arrivedAt: Date.now(),
    store: template.store,
    destination: template.destination,
    notes: template.notes,
  };
}

const REQUEST_EXPIRY_MS = 60_000;
const SPAWN_INTERVAL_MS = 18_000;

function CourierDemoFlow({ authContext }: CourierDemoFlowProps) {
  const searchParams = useSearchParams();
  const [online, setOnline] = useState(false);
  const [queue, setQueue] = useState<IncomingRequest[]>([]);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [pushPrimed, setPushPrimed] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const spawnCounter = useRef(0);

  const name = authContext.user.email.split('@')[0];

  const spawnNextRequest = useCallback(() => {
    spawnCounter.current += 1;
    setQueue((current) => [
      newRequest(spawnCounter.current, `${Date.now()}-${spawnCounter.current}`),
      ...current,
    ]);
  }, []);

  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'ativo') {
      setOnline(true);
      const template = sampleStores[0];
      if (!template) return;
      setActiveRide({
        id: 'demo-active',
        status: 'aceito',
        acceptedAt: Date.now(),
        store: template.store,
        destination: template.destination,
        notes: template.notes,
      });
    } else if (demo === 'solicitacao') {
      setOnline(true);
      setPushPrimed(true);
      spawnNextRequest();
    }
  }, [searchParams, spawnNextRequest]);

  useEffect(() => {
    if (!online || activeRide) return;
    const timer = setInterval(() => {
      spawnNextRequest();
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [online, activeRide, spawnNextRequest]);

  useEffect(() => {
    if (queue.length === 0) return;
    const timer = setInterval(() => {
      setQueue((current) => {
        const now = Date.now();
        return current.filter((request) => now - request.arrivedAt < REQUEST_EXPIRY_MS);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [queue.length]);

  function handleToggleOnline() {
    if (!online && !pushPrimed) {
      setPushOpen(true);
      return;
    }
    setOnline((value) => !value);
    if (online) setQueue([]);
  }

  function handlePushEnable() {
    setPushPrimed(true);
    setPushOpen(false);
    setOnline(true);
  }

  function handleAccept(id: string) {
    const target = queue.find((request) => request.id === id);
    if (!target) return;
    setActiveRide({
      id: target.id,
      status: 'aceito',
      acceptedAt: Date.now(),
      store: target.store,
      destination: target.destination,
      notes: target.notes,
    });
    setQueue([]);
  }

  function handleDecline(id: string) {
    setQueue((current) => current.filter((request) => request.id !== id));
  }

  function handleAdvance(next: RideStatus) {
    setActiveRide((current) => (current ? { ...current, status: next } : current));
  }

  function handleFinish() {
    setActiveRide(null);
    setTodayCount((value) => value + 1);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sua rua, sua moto"
        title={`Olá, ${name}.`}
        description="Prévia do painel do motoboy. Online, notificações e aceite real dependem do próximo backend."
      />

      <StatusToggleCard
        online={online}
        onToggle={handleToggleOnline}
        disabled={Boolean(activeRide)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Hoje" value={todayCount} subtitle="demos concluídas" tone="brand" />
        <MiniStat label="Status" value={online ? 'Online' : 'Offline'} subtitle={online ? 'simulado' : 'pausado'} tone={online ? 'success' : 'paper'} />
        <MiniStat
          label="Notificações"
          value={pushPrimed ? 'Ok' : '—'}
          subtitle={pushPrimed ? 'prévia ativa' : 'pendentes'}
          tone={pushPrimed ? 'route' : 'warn'}
        />
      </div>

      {activeRide ? (
        <CorridaAtiva
          ride={activeRide}
          onAdvance={handleAdvance}
          onFinish={handleFinish}
        />
      ) : (
        <SolicitacoesSection
          online={online}
          queue={queue}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {!pushPrimed && !activeRide ? (
        <Card variant="white" className="border-route-200 bg-route-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 text-route-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-extrabold text-route-700">
                  Prévia de notificações da central
                </p>
                <p className="mt-1 text-xs text-route-700/85">
                  Este passo só simula a permissão; push real entra em ciclo próprio.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPushOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-route-500 px-4 text-sm font-extrabold text-white hover:bg-route-600"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              Abrir prévia
            </button>
          </div>
        </Card>
      ) : null}

      <PushPrimeSheet
        open={pushOpen}
        onClose={() => setPushOpen(false)}
        onEnable={handlePushEnable}
      />
    </div>
  );
}

interface StatusToggleCardProps {
  online: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function StatusToggleCard({ online, disabled, onToggle }: StatusToggleCardProps) {
  return (
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
              'flex h-16 w-16 items-center justify-center rounded-md text-white shadow-pop transition-colors',
              online ? 'bg-brand-500' : 'bg-asphalt-950',
            )}
          >
            <Bike className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Status atual
            </p>
            <p className="text-2xl font-black text-asphalt-950">
              {online ? 'Online · simulação ativa' : 'Offline · simulação pausada'}
            </p>
            <p className="mt-1 text-sm text-asphalt-950/70">
              {online
                ? 'Solicitações de exemplo aparecem no painel.'
                : 'Toque para iniciar a prévia visual do painel.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            'inline-flex h-16 min-w-48 items-center justify-center gap-2 rounded-md px-6 text-base font-extrabold transition-all duration-ride ease-ride disabled:cursor-not-allowed disabled:opacity-60',
            online
              ? 'bg-asphalt-950 text-white shadow-ink hover:bg-asphalt-700'
              : 'bg-brand-500 text-white shadow-pop hover:bg-brand-600',
          )}
        >
          <Power className="h-5 w-5" aria-hidden="true" />
          {online ? 'Ficar offline' : 'Ficar online'}
        </button>
      </div>
      {disabled ? (
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-asphalt-950/65">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          Você está em uma corrida — toggle bloqueado até finalizar.
        </p>
      ) : null}
    </Card>
  );
}

interface SolicitacoesSectionProps {
  online: boolean;
  queue: IncomingRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function SolicitacoesSection({
  online,
  queue,
  onAccept,
  onDecline,
}: SolicitacoesSectionProps) {
  if (!online) {
    return (
      <Card variant="paper" className="text-center">
        <div className="flex flex-col items-center gap-3 py-10">
          <BoxMark size={108} tone="paper" />
          <BellOff className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
          <p className="text-lg font-extrabold text-asphalt-950">Você está offline.</p>
          <p className="max-w-md text-sm text-asphalt-950/65">
            Ative o status acima para ver chamados demonstrativos da central.
          </p>
        </div>
      </Card>
    );
  }

  if (queue.length === 0) {
    return (
      <Card variant="white" className="text-center">
        <div className="flex flex-col items-center gap-3 py-10">
          <BoxMark size={108} />
          <Inbox className="h-5 w-5 text-brand-600" aria-hidden="true" />
          <p className="text-lg font-extrabold text-asphalt-950">
            Pronto. Quando a simulação gerar uma loja, aparece aqui.
          </p>
          <p className="max-w-md text-sm text-asphalt-950/65">
            O card entra deslizando da esquerda para demonstrar a experiência planejada de aceite.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <section aria-labelledby="solicitacoes-titulo" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="solicitacoes-titulo" className="text-lg font-black text-asphalt-950">
          Solicitações demo
        </h2>
        <Badge tone="brand" pulsing>
          {queue.length} simulação
        </Badge>
      </div>
      <div className="space-y-3">
        {queue.map((request) => (
          <SolicitacaoCard
            key={request.id}
            request={request}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        ))}
      </div>
      <p className="text-center text-xs text-asphalt-950/55">
        Cada solicitação demo expira em 60s. Aceite concorrente real ainda não está ativo.
      </p>
    </section>
  );
}

interface MiniStatProps {
  label: string;
  value: number | string;
  subtitle: string;
  tone: 'brand' | 'route' | 'success' | 'warn' | 'paper';
}

function MiniStat({ label, value, subtitle, tone }: MiniStatProps) {
  const toneMap = {
    brand: 'border-brand-200',
    route: 'border-route-200',
    success: 'border-success-500/30',
    warn: 'border-warn-500/30',
    paper: 'border-paper-line',
  };

  return (
    <Card variant="white" className={cn(toneMap[tone])}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-asphalt-950 sm:text-3xl">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-asphalt-950/60">{subtitle}</p>
    </Card>
  );
}
