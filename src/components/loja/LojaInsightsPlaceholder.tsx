'use client';

import { Activity, Clock3, MapPin, TrendingUp } from 'lucide-react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';

const futureCharts = [
  {
    icon: TrendingUp,
    title: 'Volume por período',
    description:
      'Total de entregas por dia, semana e mês — com comparação entre janelas.',
  },
  {
    icon: Clock3,
    title: 'Tempo médio até aceite',
    description: 'Quanto tempo, em média, a rede leva pra aceitar uma solicitação sua.',
  },
  {
    icon: MapPin,
    title: 'Destinos mais frequentes',
    description: 'Ranking dos bairros que mais recebem entrega da sua loja.',
  },
  {
    icon: Activity,
    title: 'Taxa de expiração',
    description: 'Quantas solicitações expiram sem ninguém aceitar.',
  },
];

export function LojaInsightsPlaceholder() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Em construção"
        title="Insights da sua loja"
        description="Quando a operação acumular dados reais, esta página vira o seu painel de controle."
      />

      <Card variant="paper" className="text-center">
        <div className="flex flex-col items-center gap-4 py-8">
          <BoxMark size={120} tone="paper" />
          <h2 className="text-2xl font-black text-asphalt-950">
            Ainda esperando dados pra brilhar.
          </h2>
          <p className="max-w-md text-sm text-asphalt-950/65">
            Os gráficos abaixo são o que entra aqui assim que sua loja gerar o histórico mínimo
            necessário.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {futureCharts.map((chart) => {
          const Icon = chart.icon;
          return (
            <Card key={chart.title} variant="white" className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-route-50 text-route-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-asphalt-950">{chart.title}</p>
                <p className="mt-1 text-xs text-asphalt-950/65">{chart.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
