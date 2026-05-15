'use client';

import { ArrowLeft, CheckCircle2, Clock3, PackagePlus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { RouteLine } from '@/components/brand/RouteLine';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, createDeliveryRequest } from '@/lib/api';
import type { DeliveryRequest } from '@/types/delivery';

import type { DeliveryDraft } from './delivery-types';
import { NovaEntregaForm, type DeliverySubmitError } from './NovaEntregaForm';

interface NovaEntregaFlowProps {
  accessToken: string;
}

const STORE_PLACEHOLDER = {
  name: 'Sua loja',
  address: 'Endereço cadastrado no perfil da loja',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function detailToText(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (!detail || typeof detail !== 'object') return null;

  const maybeDetail = detail as { path?: unknown; message?: unknown };
  const message = typeof maybeDetail.message === 'string' ? maybeDetail.message : null;
  const path = typeof maybeDetail.path === 'string' ? maybeDetail.path : null;

  if (!message) return null;
  return path ? `${path}: ${message}` : message;
}

function mapCreateError(error: unknown): DeliverySubmitError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Não foi possível criar a entrega',
      message: 'Tente novamente em instantes.',
    };
  }

  const details = error.details.map(detailToText).filter((detail): detail is string => Boolean(detail));

  const permissionMessage =
    'Somente uma loja ativa pode criar solicitação de entrega por esta tela.';

  switch (error.code) {
    case 'VALIDATION_ERROR':
      return {
        title: 'Revise os dados da entrega',
        message: 'O destino é obrigatório e a observação precisa respeitar o limite do contrato.',
        details,
      };
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovação',
        message: 'Seu cadastro ainda precisa ser aprovado antes de criar entregas.',
      };
    case 'USER_BLOCKED':
      return {
        title: 'Conta bloqueada',
        message: 'Sua conta está bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
    case 'STORE_PROFILE_REQUIRED':
      return {
        title: 'Permissão negada',
        message: permissionMessage,
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessão inválida',
        message: 'Entre novamente para criar uma entrega.',
      };
    case 'API_URL_MISSING':
      return {
        title: 'API não configurada',
        message: error.message,
      };
    default:
      return {
        title: 'Não foi possível criar a entrega',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

export function NovaEntregaFlow({ accessToken }: NovaEntregaFlowProps) {
  const [draft, setDraft] = useState<DeliveryDraft | null>(null);
  const [createdDelivery, setCreatedDelivery] = useState<DeliveryRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<DeliverySubmitError | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(submitted: DeliveryDraft) {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        destinationAddress: submitted.destinationAddress,
        ...(submitted.notes ? { notes: submitted.notes } : {}),
      };
      const delivery = await createDeliveryRequest(accessToken, payload);
      setDraft(submitted);
      setCreatedDelivery(delivery);
    } catch (error) {
      setSubmitError(mapCreateError(error));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleNewRequest() {
    setDraft(null);
    setCreatedDelivery(null);
    setSubmitError(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pedido em movimento"
        title="Nova entrega"
        description="Crie uma solicitação real para sua loja. Aceite, realtime, push, cron e histórico seguem bloqueados para ciclos próprios."
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

      {createdDelivery ? (
        <CreatedDeliveryState delivery={createdDelivery} onNewRequest={handleNewRequest} />
      ) : (
        <NovaEntregaForm
          onSubmit={handleSubmit}
          initialDraft={draft ?? undefined}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}

interface CreatedDeliveryStateProps {
  delivery: DeliveryRequest;
  onNewRequest: () => void;
}

function CreatedDeliveryState({ delivery, onNewRequest }: CreatedDeliveryStateProps) {
  const shortId = delivery.id.slice(0, 8);

  return (
    <section className="space-y-5 animate-fade-in" aria-live="polite">
      <Card variant="white" className="border-success-500/30 bg-success-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-success-500 text-white shadow-pop">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-success-700">
                Solicitação criada
              </p>
              <h2 className="mt-1 text-2xl font-black text-asphalt-950">
                Entrega #{shortId} aguardando próxima etapa.
              </h2>
              <p className="mt-1 text-sm font-medium text-asphalt-950/70">
                Status recebido do backend: {delivery.status}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="md" onClick={onNewRequest}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Criar outra
          </Button>
        </div>
      </Card>

      <Card variant="white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
              Resumo da entrega
            </p>
            <h3 className="mt-1 text-lg font-black text-asphalt-950">
              Pedido registrado na API
            </h3>
          </div>
          <PackagePlus className="h-6 w-6 text-asphalt-950/45" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-md border border-paper-line bg-paper p-4">
          <RouteLine
            from={`${STORE_PLACEHOLDER.name} — ${STORE_PLACEHOLDER.address}`}
            to={delivery.destination_address}
          />
        </div>

        {delivery.notes ? (
          <p className="mt-4 rounded-md border border-dashed border-paper-line p-3 text-sm text-asphalt-950/75">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Observação
            </span>
            <span className="mt-1 block">{delivery.notes}</span>
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatusTile label="Criada em" value={formatDateTime(delivery.created_at)} />
          <StatusTile label="Status" value={delivery.status} />
          <StatusTile label="Motoboy" value={delivery.courier_id ? 'Atribuído' : 'Ainda não atribuído'} />
        </div>
      </Card>

      <Alert tone="info" title="Escopo desta etapa">
        A solicitação foi criada no backend. Esta tela ainda não lista histórico, não notifica
        motoboys, não assina realtime, não executa aceite concorrente e não cancela/expira
        automaticamente.
      </Alert>
    </section>
  );
}

interface StatusTileProps {
  label: string;
  value: string;
}

function StatusTile({ label, value }: StatusTileProps) {
  return (
    <div className="rounded-md border border-paper-line bg-paper p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm font-black text-asphalt-950">
        <Clock3 className="h-3.5 w-3.5 text-route-600" aria-hidden="true" />
        {value}
      </p>
    </div>
  );
}
