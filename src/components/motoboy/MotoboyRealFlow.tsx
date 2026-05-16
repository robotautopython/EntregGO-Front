'use client';

import { Loader2, Power, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getActiveDelivery, getCourierStatus, updateCourierStatus } from '@/lib/api';
import type { CourierOperationalStatus } from '@/types/auth';
import type { ActiveDelivery } from '@/types/delivery';

import { CorridaAtivaReal } from './CorridaAtivaReal';
import { FilaDisponivel, mapCourierError, type CourierError } from './FilaDisponivel';

interface MotoboyRealFlowProps {
  accessToken: string;
}

export function MotoboyRealFlow({ accessToken }: MotoboyRealFlowProps) {
  const activeLoadId = useRef(0);
  const [status, setStatus] = useState<CourierOperationalStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<CourierError | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [isCheckingActive, setIsCheckingActive] = useState(false);
  const [activeError, setActiveError] = useState<CourierError | null>(null);

  const clearActiveState = useCallback(() => {
    activeLoadId.current += 1;
    setActiveDelivery(null);
    setActiveError(null);
    setIsCheckingActive(false);
  }, []);

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      const data = await getCourierStatus(accessToken);
      if (data?.is_online) {
        setIsCheckingActive(true);
      } else {
        clearActiveState();
      }
      setStatus(data ?? null);
    } catch (caught) {
      setStatus(null);
      setStatusError(mapCourierError(caught));
      clearActiveState();
    } finally {
      setIsLoadingStatus(false);
    }
  }, [accessToken, clearActiveState]);

  const loadActiveDelivery = useCallback(async () => {
    const loadId = activeLoadId.current + 1;
    activeLoadId.current = loadId;
    setIsCheckingActive(true);
    setActiveError(null);
    try {
      const data = await getActiveDelivery(accessToken);
      if (loadId === activeLoadId.current) {
        setActiveDelivery(data ?? null);
      }
    } catch (caught) {
      if (loadId === activeLoadId.current) {
        setActiveDelivery(null);
        setActiveError(mapCourierError(caught));
      }
    } finally {
      if (loadId === activeLoadId.current) {
        setIsCheckingActive(false);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status?.is_online) {
      void loadActiveDelivery();
      return;
    }

    clearActiveState();
  }, [clearActiveState, loadActiveDelivery, status?.is_online]);

  const handleStatusChange = useCallback(
    async (isOnline: boolean) => {
      if (isUpdatingStatus) return;
      setIsUpdatingStatus(true);
      setStatusError(null);
      try {
        if (isOnline) {
          setIsCheckingActive(true);
        } else {
          clearActiveState();
        }

        const data = await updateCourierStatus(accessToken, isOnline);
        setStatus(data ?? null);

        if (!data?.is_online) {
          clearActiveState();
        }
      } catch (caught) {
        setStatusError(mapCourierError(caught));
        if (!isOnline) {
          setIsCheckingActive(false);
        }
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [accessToken, clearActiveState, isUpdatingStatus],
  );

  if (isLoadingStatus) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operacao"
          title="Painel do motoboy"
          description="Carregando seu status operacional antes de abrir a fila."
        />
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Verificando status operacional...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (statusError && !status) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operacao"
          title="Painel do motoboy"
          description="Nao foi possivel carregar seu status operacional agora."
        />
        <Alert tone="danger" title={statusError.title}>
          {statusError.message}
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => void loadStatus()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (status && !status.is_online) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operacao"
          title="Painel do motoboy"
          description="Fique online para buscar corridas ativas e entregas disponiveis."
        />
        <StatusControl
          status={status}
          isUpdating={isUpdatingStatus}
          onChange={(value) => void handleStatusChange(value)}
        />
        {statusError ? (
          <Alert tone="danger" title={statusError.title}>
            {statusError.message}
          </Alert>
        ) : null}
        <Alert tone="info" title="Voce esta offline">
          Enquanto estiver offline, o app nao consulta corrida ativa nem fila de entregas.
        </Alert>
      </div>
    );
  }

  if (isCheckingActive && !activeDelivery) {
    return (
      <div className="space-y-6">
        {status ? (
          <StatusControl
            status={status}
            isUpdating={isUpdatingStatus}
            onChange={(value) => void handleStatusChange(value)}
          />
        ) : null}
        <PageHeader
          eyebrow="Operacao"
          title="Painel do motoboy"
          description="Verificando se existe uma corrida aceita antes de abrir a fila."
        />
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Verificando corrida ativa...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (activeError) {
    return (
      <div className="space-y-6">
        {status ? (
          <StatusControl
            status={status}
            isUpdating={isUpdatingStatus}
            onChange={(value) => void handleStatusChange(value)}
          />
        ) : null}
        <PageHeader
          eyebrow="Operacao"
          title="Painel do motoboy"
          description="Nao foi possivel carregar a corrida ativa agora."
        />
        <Alert tone="danger" title={activeError.title}>
          {activeError.message}
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => void loadActiveDelivery()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (activeDelivery) {
    return (
      <div className="space-y-6">
        {status ? (
          <StatusControl
            status={status}
            isUpdating={isUpdatingStatus}
            onChange={(value) => void handleStatusChange(value)}
          />
        ) : null}
        <CorridaAtivaReal
          delivery={activeDelivery}
          isRefreshing={isCheckingActive}
          onRefresh={() => void loadActiveDelivery()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status ? (
        <StatusControl
          status={status}
          isUpdating={isUpdatingStatus}
          onChange={(value) => void handleStatusChange(value)}
        />
      ) : null}
      {statusError ? (
        <Alert tone="danger" title={statusError.title}>
          {statusError.message}
        </Alert>
      ) : null}
      <FilaDisponivel
        accessToken={accessToken}
        onAccepted={() => {
          void loadActiveDelivery();
        }}
      />
    </div>
  );
}

interface StatusControlProps {
  status: CourierOperationalStatus;
  isUpdating: boolean;
  onChange: (isOnline: boolean) => void;
}

function StatusControl({ status, isUpdating, onChange }: StatusControlProps) {
  const isOnline = status.is_online;

  return (
    <Card
      variant={isOnline ? 'white' : 'paper'}
      className={isOnline ? 'border-success-500/30 bg-success-50' : ''}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white shadow-pop ${
              isOnline ? 'bg-success-500' : 'bg-asphalt-950'
            }`}
          >
            <Power className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              Status operacional
            </p>
            <p className="text-lg font-black text-asphalt-950">
              {isOnline ? 'Online' : 'Offline'}
            </p>
            <p className="text-xs font-bold text-asphalt-950/55">
              Atualizado em {formatStatusInstant(status.updated_at)}
            </p>
          </div>
        </div>
        <Button
          variant={isOnline ? 'secondary' : 'primary'}
          onClick={() => onChange(!isOnline)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Power className="h-4 w-4" aria-hidden="true" />
          )}
          {isOnline ? 'Ficar offline' : 'Ficar online'}
        </Button>
      </div>
    </Card>
  );
}

const statusTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function formatStatusInstant(iso: string): string {
  return statusTimeFormatter.format(new Date(iso));
}
