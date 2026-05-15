'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';

import { AcceptedState } from './AcceptedState';
import type { AcceptedDelivery, DeliveryDraft, DeliveryFlowState } from './delivery-types';
import { ExpiredState } from './ExpiredState';
import { NovaEntregaForm } from './NovaEntregaForm';
import { SearchingState } from './SearchingState';

const STORE_PLACEHOLDER = {
  name: 'Sua Loja',
  address: 'Endereço da loja cadastrada',
};

const DEMO_ACCEPTED: AcceptedDelivery = {
  id: 'demo-accepted',
  status: 'aceito',
  acceptedAt: new Date().toISOString(),
  courier: {
    name: 'João Marques',
    initials: 'JM',
    bikePlate: 'Honda CG 160 · ABC-1D23',
    distanceLabel: '2.5 km da sua loja',
  },
  route: {
    from: `${STORE_PLACEHOLDER.name} — ${STORE_PLACEHOLDER.address}`,
    to: 'Av. Brasil, 884 — Apto 51, Centro',
    notes: 'Deixar com o porteiro.',
  },
};

export function NovaEntregaFlow() {
  const searchParams = useSearchParams();
  const [flowState, setFlowState] = useState<DeliveryFlowState>('idle');
  const [draft, setDraft] = useState<DeliveryDraft | null>(null);
  const [accepted, setAccepted] = useState<AcceptedDelivery | null>(null);

  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'aceito') {
      setDraft({
        destinationAddress: DEMO_ACCEPTED.route.to.split(' · ')[0] ?? 'Endereço de destino',
        notes: DEMO_ACCEPTED.route.notes,
      });
      setAccepted(DEMO_ACCEPTED);
      setFlowState('accepted');
    } else if (demo === 'expirou') {
      setDraft({ destinationAddress: 'Av. Brasil, 884 — Apto 51, Centro' });
      setFlowState('expired');
    }
  }, [searchParams]);

  function handleSubmit(submitted: DeliveryDraft) {
    setDraft(submitted);
    setFlowState('searching');
  }

  function handleExpire() {
    setFlowState('expired');
  }

  function handleCancel() {
    setFlowState('idle');
  }

  function handleRetry() {
    setFlowState('searching');
  }

  function handleEdit() {
    setFlowState('idle');
  }

  function handleNewRequest() {
    setDraft(null);
    setAccepted(null);
    setFlowState('idle');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pedido em movimento"
        title="Nova entrega"
        description="Preencha o destino, envie pra rede e acompanhe o aceite — sem complicação."
        actions={
          <Link
            href="/loja"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-paper-line bg-white px-4 text-sm font-bold text-asphalt-950 hover:border-brand-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Link>
        }
      />

      {flowState === 'idle' ? (
        <NovaEntregaForm onSubmit={handleSubmit} initialDraft={draft ?? undefined} />
      ) : null}

      {flowState === 'searching' && draft ? (
        <SearchingState
          draft={draft}
          storeAddress={STORE_PLACEHOLDER.address}
          storeName={STORE_PLACEHOLDER.name}
          onExpire={handleExpire}
          onCancel={handleCancel}
        />
      ) : null}

      {flowState === 'accepted' && accepted ? (
        <AcceptedState delivery={accepted} onNewRequest={handleNewRequest} />
      ) : null}

      {flowState === 'expired' && draft ? (
        <ExpiredState
          draft={draft}
          storeName={STORE_PLACEHOLDER.name}
          onRetry={handleRetry}
          onEdit={handleEdit}
        />
      ) : null}
    </div>
  );
}
