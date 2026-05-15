'use client';

import { Pencil, RefreshCw } from 'lucide-react';

import { BoxMark } from '@/components/brand/BoxMark';
import { RouteLine } from '@/components/brand/RouteLine';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import type { DeliveryDraft } from './delivery-types';

interface ExpiredStateProps {
  draft: DeliveryDraft;
  storeName: string;
  onRetry: () => void;
  onEdit: () => void;
}

export function ExpiredState({ draft, storeName, onRetry, onEdit }: ExpiredStateProps) {
  return (
    <section
      className="rounded-lg border border-paper-line bg-white p-8 text-center shadow-card animate-fade-in sm:p-12"
      aria-live="polite"
    >
      <div className="mx-auto flex flex-col items-center gap-5">
        <BoxMark size={120} tone="paper" />

        <div className="space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-danger-700">
            Tempo esgotado
          </p>
          <h2 className="text-3xl font-black text-asphalt-950">
            Nenhum aceite nesta simulação.
          </h2>
          <p className="mx-auto max-w-md text-sm text-asphalt-950/70">
            Use este estado para validar o layout de expiração enquanto o aceite real não existe.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-lg border border-dashed border-paper-line bg-paper p-5 text-left">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
            Última simulação
          </p>
          <div className="mt-3">
            <RouteLine from={storeName} to={draft.destinationAddress} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="primary" size="lg" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Simular novamente
          </Button>
          <Button variant="secondary" size="lg" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar e tentar de novo
          </Button>
        </div>
      </div>

      <Card variant="paper" className="mt-8 text-left">
        <p className="text-sm font-bold text-asphalt-950">Dicas pra próxima tentativa</p>
        <ul className="mt-2 space-y-1.5 text-sm text-asphalt-950/75">
          <li>· Confirme se o endereço tem número e bairro.</li>
          <li>· Adicione complemento (apto, sala, ponto de referência).</li>
          <li>· Use novas tentativas apenas para validar o fluxo visual.</li>
        </ul>
      </Card>
    </section>
  );
}
