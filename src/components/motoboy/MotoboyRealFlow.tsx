'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getActiveDelivery } from '@/lib/api';
import type { ActiveDelivery } from '@/types/delivery';

import { CorridaAtivaReal } from './CorridaAtivaReal';
import { FilaDisponivel, mapCourierError, type CourierError } from './FilaDisponivel';

interface MotoboyRealFlowProps {
  accessToken: string;
}

export function MotoboyRealFlow({ accessToken }: MotoboyRealFlowProps) {
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [isCheckingActive, setIsCheckingActive] = useState(true);
  const [activeError, setActiveError] = useState<CourierError | null>(null);

  const loadActiveDelivery = useCallback(async () => {
    setIsCheckingActive(true);
    setActiveError(null);
    try {
      const data = await getActiveDelivery(accessToken);
      setActiveDelivery(data ?? null);
    } catch (caught) {
      setActiveDelivery(null);
      setActiveError(mapCourierError(caught));
    } finally {
      setIsCheckingActive(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadActiveDelivery();
  }, [loadActiveDelivery]);

  if (isCheckingActive && !activeDelivery) {
    return (
      <div className="space-y-6">
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
      <CorridaAtivaReal
        delivery={activeDelivery}
        isRefreshing={isCheckingActive}
        onRefresh={() => void loadActiveDelivery()}
      />
    );
  }

  return (
    <FilaDisponivel
      accessToken={accessToken}
      onAccepted={() => {
        void loadActiveDelivery();
      }}
    />
  );
}
