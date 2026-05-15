'use client';

import { ArrowRight, History, Package, PackagePlus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { AuthContext } from '@/types/auth';

interface LojaHomeProps {
  authContext: AuthContext;
}

const sampleKpis = [
  { label: 'Entregas hoje', value: 0, tone: 'brand' as const },
  { label: 'Em andamento', value: 0, tone: 'route' as const },
  { label: 'Este mês', value: 0, tone: 'paper' as const },
];

export function LojaHome({ authContext }: LojaHomeProps) {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Olá, ${authContext.user.email.split('@')[0]}`}
        title="Sua central, em uma tela."
        description="Solicite entregas, acompanhe o status e veja seu histórico operacional."
      />

      <Link
        href="/loja/nova-entrega"
        className="group relative block overflow-hidden rounded-lg bg-brand-500 p-6 text-white shadow-pop transition-transform duration-ride ease-ride hover:-translate-y-0.5 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-brand-600 opacity-60 blur-3xl transition-transform group-hover:scale-110"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 opacity-25"
        >
          <BoxMark size={220} tone="paper" />
        </div>
        <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Badge tone="signal" className="border-white/20 bg-white/15 text-white">
              Em 1 clique
            </Badge>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Solicitar nova entrega
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/85">
              Endereço de destino e observação. A central avisa os motoboys online —
              primeiro toque vence.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-asphalt-950 px-5 py-3 text-sm font-extrabold shadow-ink transition-colors group-hover:bg-asphalt-700">
            Começar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      </Link>

      <div className="grid gap-3 sm:grid-cols-3">
        {sampleKpis.map((kpi) => (
          <Card key={kpi.label} variant="white">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              {kpi.label}
            </p>
            <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums text-asphalt-950">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-asphalt-950/60">Dados reais aparecem aqui em breve.</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card variant="white" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-route-600">
                Em andamento
              </p>
              <h3 className="text-lg font-black text-asphalt-950">Nenhuma corrida ativa</h3>
            </div>
            <Package className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-paper-line bg-paper p-8 text-center">
            <BoxMark size={88} tone="paper" />
            <p className="text-sm font-bold text-asphalt-950">
              Quando sua entrega for aceita, ela aparece aqui.
            </p>
            <p className="max-w-xs text-xs text-asphalt-950/60">
              O motoboy passa do balcão até o destino, e você acompanha cada etapa.
            </p>
          </div>
        </Card>

        <Card variant="white" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                Histórico recente
              </p>
              <h3 className="text-lg font-black text-asphalt-950">Sem entregas ainda</h3>
            </div>
            <History className="h-5 w-5 text-asphalt-950/45" aria-hidden="true" />
          </div>
          <div className="rounded-md border border-dashed border-paper-line bg-paper p-6 text-sm text-asphalt-950/65">
            Você verá aqui as últimas corridas, com motoboy, destino e status final.
          </div>
          <Link
            href="/loja/historico"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 hover:underline"
          >
            Ver tudo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <Card variant="paper" className="border-dashed">
        <div className="flex items-start gap-4">
          <TrendingUp className="mt-1 h-5 w-5 text-route-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-asphalt-950">Quer ver insights da loja?</p>
            <p className="text-xs text-asphalt-950/65">
              Acompanhe tempo médio de aceite, taxa de expiração e ranking dos motoboys que mais
              entregam pra você.
            </p>
            <Link
              href="/loja/insights"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-extrabold text-route-700 hover:underline"
            >
              Abrir insights
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Card>

      <Card variant="white" className="border-brand-200 bg-brand-50">
        <div className="flex items-start gap-3">
          <PackagePlus className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div className="text-sm text-brand-700">
            <p className="font-extrabold">Construindo este painel</p>
            <p className="mt-1 leading-6 text-brand-700/85">
              A versão completa, com solicitação real e histórico, entra na próxima etapa. O
              esqueleto, navegação e identidade já estão em pé.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
