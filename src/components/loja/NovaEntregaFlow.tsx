'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PackagePlus,
  RefreshCw,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { RouteLine } from '@/components/brand/RouteLine';
import { useInAppNotifications } from '@/components/shell/InAppNotifications';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClientApiError, createDeliveryRequest, getMyDelivery } from '@/lib/api';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';
import type { DeliveryRequest } from '@/types/delivery';

import type { DeliveryDraft } from './delivery-types';
import { NovaEntregaForm, type DeliverySubmitError } from './NovaEntregaForm';

interface NovaEntregaFlowProps {
  accessToken: string;
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const REALTIME_NOTICE_DISMISS_MS = 4000;

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

  const details = error.details
    .map(detailToText)
    .filter((detail): detail is string => Boolean(detail));

  const permissionMessage =
    'Somente uma loja ativa pode criar solicitação de entrega por esta tela.';

  switch (error.code) {
    case 'VALIDATION_ERROR':
      return {
        title: 'Revise os dados da entrega',
        message: 'Confira os limites dos campos e tente novamente.',
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
        ...(submitted.destinationAddress
          ? { destinationAddress: submitted.destinationAddress }
          : {}),
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
        description="Crie uma solicitação real para sua loja e abra o acompanhamento assim que ela nascer."
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
        <CreatedDeliveryState
          accessToken={accessToken}
          delivery={createdDelivery}
          onDeliveryUpdate={setCreatedDelivery}
          onNewRequest={handleNewRequest}
        />
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
  accessToken: string;
  delivery: DeliveryRequest;
  onDeliveryUpdate: (delivery: DeliveryRequest) => void;
  onNewRequest: () => void;
}

function CreatedDeliveryState({
  accessToken,
  delivery,
  onDeliveryUpdate,
  onNewRequest,
}: CreatedDeliveryStateProps) {
  const shortId = delivery.id.slice(0, 8);
  const acceptedCourierName = delivery.accepted_at ? delivery.courier?.full_name : null;
  const loadRequestId = useRef(0);
  const loadInFlight = useRef(false);
  const queuedLoad = useRef(false);
  const isActive = useRef(true);
  const realtimeRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);
  const { notify } = useInAppNotifications();

  const loadDelivery = useCallback(
    async (mode: 'refresh' | 'realtime' = 'refresh') => {
      if (loadInFlight.current) {
        queuedLoad.current = true;
        return;
      }

      const requestId = loadRequestId.current + 1;
      loadRequestId.current = requestId;
      loadInFlight.current = true;
      if (mode === 'refresh') {
        setIsRefreshing(true);
      }
      setRefreshError(null);

      try {
        const updatedDelivery = await getMyDelivery(accessToken, delivery.id);
        if (isActive.current && requestId === loadRequestId.current) {
          onDeliveryUpdate(updatedDelivery);
        }
      } catch {
        if (isActive.current && requestId === loadRequestId.current && mode === 'refresh') {
          setRefreshError('Nao foi possivel atualizar a entrega agora.');
        }
      } finally {
        if (isActive.current && requestId === loadRequestId.current) {
          setIsRefreshing(false);
        }
        loadInFlight.current = false;
        if (isActive.current && queuedLoad.current) {
          queuedLoad.current = false;
          void loadDelivery('realtime');
        }
      }
    },
    [accessToken, delivery.id, onDeliveryUpdate],
  );

  const showRealtimeNotice = useCallback(
    (shouldNotifyShell: boolean) => {
      const message = 'A entrega foi atualizada.';
      setRealtimeNotice(message);
      if (shouldNotifyShell) {
        notify(message);
      }
      if (realtimeNoticeTimer.current) {
        clearTimeout(realtimeNoticeTimer.current);
      }

      realtimeNoticeTimer.current = setTimeout(() => {
        realtimeNoticeTimer.current = null;
        setRealtimeNotice(null);
      }, REALTIME_NOTICE_DISMISS_MS);
    },
    [notify],
  );

  const scheduleRealtimeRefresh = useCallback(() => {
    const shouldNotifyShell =
      !realtimeRefreshTimer.current && !loadInFlight.current && !queuedLoad.current;
    showRealtimeNotice(shouldNotifyShell);

    if (realtimeRefreshTimer.current) {
      clearTimeout(realtimeRefreshTimer.current);
    }

    const debounceWithJitterMs = 400 + Math.floor(Math.random() * 150);
    realtimeRefreshTimer.current = setTimeout(() => {
      realtimeRefreshTimer.current = null;
      void loadDelivery('realtime');
    }, debounceWithJitterMs);
  }, [loadDelivery, showRealtimeNotice]);

  useEffect(() => {
    isActive.current = true;
    const unsubscribe = subscribeToStoreDeliveryBroadcast(
      accessToken,
      delivery.id,
      scheduleRealtimeRefresh,
    );

    return () => {
      if (realtimeRefreshTimer.current) {
        clearTimeout(realtimeRefreshTimer.current);
        realtimeRefreshTimer.current = null;
      }
      if (realtimeNoticeTimer.current) {
        clearTimeout(realtimeNoticeTimer.current);
        realtimeNoticeTimer.current = null;
      }
      isActive.current = false;
      queuedLoad.current = false;
      unsubscribe();
    };
  }, [accessToken, delivery.id, scheduleRealtimeRefresh]);

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
                {acceptedCourierName
                  ? `Entrega #${shortId} aceita por ${acceptedCourierName}.`
                  : `Entrega #${shortId} aguardando próxima etapa.`}
              </h2>
              <p className="mt-1 text-sm font-medium text-asphalt-950/70">
                Status recebido do backend: {delivery.status}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="md"
              disabled={isRefreshing}
              onClick={() => void loadDelivery('refresh')}
            >
              <RefreshCw
                className={`h-4 w-4${isRefreshing ? ' animate-spin' : ''}`}
                aria-hidden="true"
              />
              Atualizar
            </Button>
            <Button variant="secondary" size="md" onClick={onNewRequest}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Criar outra
            </Button>
            <ButtonLink href={`/loja/entregas/${delivery.id}`} variant="primary" size="md">
              Acompanhar entrega
            </ButtonLink>
          </div>
        </div>
      </Card>

      {realtimeNotice ? (
        <Alert tone="info" title="Atualizacao em tempo real">
          {realtimeNotice}
        </Alert>
      ) : null}

      {refreshError ? (
        <Alert tone="danger" title="Atualizacao nao concluida">
          {refreshError}
        </Alert>
      ) : null}

      <Card variant="white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
              Resumo da entrega
            </p>
            <h3 className="mt-1 text-lg font-black text-asphalt-950">Pedido registrado na API</h3>
          </div>
          <PackagePlus className="h-6 w-6 text-asphalt-950/45" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-md border border-paper-line bg-paper p-4">
          <RouteLine
            from={`${delivery.store.name} - ${delivery.store.address}`}
            to={delivery.destination_address ?? 'Destino não informado'}
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatusTile label="Criada em" value={formatDateTime(delivery.created_at)} />
          <StatusTile label="Status" value={delivery.status} />
          {acceptedCourierName ? (
            <StatusTile label="Motoboy" value={acceptedCourierName} icon={UserCheck} />
          ) : null}
          {delivery.accepted_at ? (
            <StatusTile label="Aceita em" value={formatDateTime(delivery.accepted_at)} />
          ) : null}
          <StatusTile label="Expira em" value={formatDateTime(delivery.expires_at)} />
        </div>
      </Card>

      <Alert tone="info" title="Escopo desta etapa">
        A solicitação foi criada no backend. O acompanhamento abre a entrega pelo contrato real e
        mostra as próximas transições conforme o motoboy avançar.
      </Alert>
    </section>
  );
}

interface StatusTileProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

function StatusTile({ label, value, icon: Icon = Clock3 }: StatusTileProps) {
  return (
    <div className="rounded-md border border-paper-line bg-paper p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm font-black text-asphalt-950">
        <Icon className="h-3.5 w-3.5 text-route-600" aria-hidden="true" />
        {value}
      </p>
    </div>
  );
}
