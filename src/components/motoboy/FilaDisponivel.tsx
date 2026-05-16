'use client';

import { CheckCircle2, Loader2, MapPin, RefreshCw, Store } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';
import { PageHeader } from '@/components/shell/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { acceptDelivery, ClientApiError, listAvailableDeliveries } from '@/lib/api';
import type {
  AcceptedDelivery,
  AvailableDeliveriesResult,
  AvailableDeliveryItem,
} from '@/types/delivery';

interface FilaDisponivelProps {
  accessToken: string;
}

const PAGE_SIZE = 20;

const REMOVE_AND_RELOAD_CODES = new Set([
  'ALREADY_ACCEPTED',
  'DELIVERY_EXPIRED',
  'DELIVERY_NOT_FOUND',
]);

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function formatInstant(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export interface CourierError {
  title: string;
  message: string;
}

export function mapCourierError(error: unknown): CourierError {
  if (!(error instanceof ClientApiError)) {
    return {
      title: 'Não foi possível concluir',
      message: 'Tente novamente em instantes.',
    };
  }

  switch (error.code) {
    case 'ALREADY_ACCEPTED':
      return {
        title: 'Entrega já aceita',
        message: 'Outro motoboy aceitou primeiro. Atualizamos a lista.',
      };
    case 'DELIVERY_EXPIRED':
      return {
        title: 'Entrega expirou',
        message: 'Essa solicitação não está mais disponível. Atualizamos a lista.',
      };
    case 'DELIVERY_NOT_FOUND':
      return {
        title: 'Entrega indisponível',
        message: 'Essa solicitação não foi encontrada. Atualizamos a lista.',
      };
    case 'COURIER_OFFLINE':
      return {
        title: 'Você está offline',
        message: 'Fique online para ver e aceitar entregas disponíveis.',
      };
    case 'COURIER_PROFILE_REQUIRED':
      return {
        title: 'Perfil de motoboy necessário',
        message: 'Conclua seu cadastro de motoboy para acessar a fila.',
      };
    case 'USER_PENDING':
      return {
        title: 'Cadastro aguardando aprovação',
        message: 'Seu cadastro ainda precisa ser aprovado para aceitar entregas.',
      };
    case 'USER_BLOCKED':
      return {
        title: 'Conta bloqueada',
        message: 'Sua conta está bloqueada. Fale com a central para regularizar o acesso.',
      };
    case 'FORBIDDEN_ROLE':
      return {
        title: 'Permissão negada',
        message: 'Somente um motoboy ativo pode ver e aceitar entregas por esta tela.',
      };
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'DOMAIN_USER_NOT_FOUND':
      return {
        title: 'Sessão inválida',
        message: 'Entre novamente para ver as entregas disponíveis.',
      };
    case 'API_URL_MISSING':
      return { title: 'API não configurada', message: error.message };
    default:
      return {
        title: 'Não foi possível concluir',
        message: error.message || 'Tente novamente em instantes.',
      };
  }
}

export function FilaDisponivel({ accessToken }: FilaDisponivelProps) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AvailableDeliveriesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CourierError | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<CourierError | null>(null);
  const [accepted, setAccepted] = useState<AcceptedDelivery | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAvailableDeliveries(accessToken, {
        page,
        limit: PAGE_SIZE,
      });
      setResult(data ?? null);
    } catch (caught) {
      setError(mapCourierError(caught));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    setActionError(null);
    void load();
  }, [load]);

  async function handleAccept(id: string) {
    if (acceptingId) return;
    setAcceptingId(id);
    setActionError(null);
    try {
      const data = await acceptDelivery(accessToken, id);
      if (data) {
        setAccepted(data);
      }
      setResult((current) =>
        current
          ? { ...current, items: current.items.filter((item) => item.id !== id) }
          : current,
      );
    } catch (caught) {
      const mapped = mapCourierError(caught);
      setActionError(mapped);
      if (caught instanceof ClientApiError && REMOVE_AND_RELOAD_CODES.has(caught.code)) {
        setResult((current) =>
          current
            ? { ...current, items: current.items.filter((item) => item.id !== id) }
            : current,
        );
        void load();
      }
    } finally {
      setAcceptingId(null);
    }
  }

  const items = useMemo<AvailableDeliveryItem[]>(() => result?.items ?? [], [result]);
  const total = result?.pagination.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  if (accepted) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operação"
          title="Entrega aceita"
          description="Confirmação desta fatia. Coleta, trânsito e conclusão entram em ciclos próprios."
        />
        <Card variant="white" className="border-success-500/30 bg-success-50">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-success-500 text-white shadow-pop">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <Badge tone="success">Aceita</Badge>
              <h2 className="mt-2 text-2xl font-black text-asphalt-950">
                {accepted.store.name}
              </h2>
              <p className="mt-1 inline-flex items-start gap-1.5 text-sm font-semibold text-asphalt-950/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success-700" aria-hidden="true" />
                {accepted.store.address}
              </p>
              <p className="mt-3 text-xs font-bold text-asphalt-950/55">
                Aceita em {formatInstant(accepted.accepted_at)} • expira em{' '}
                {formatInstant(accepted.expires_at)}
              </p>
            </div>
          </div>
        </Card>
        <Alert tone="info" title="O que vem depois">
          As etapas de coleta, trânsito e entrega, além de notificações e tempo real, ainda
          não fazem parte desta fatia.
        </Alert>
        <Button
          variant="secondary"
          onClick={() => {
            setAccepted(null);
            void load();
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Voltar para a fila
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Entregas disponíveis"
        description="Solicitações abertas agora. Esta lista é um instantâneo: use Atualizar para buscar novas — não há tempo real nesta fatia."
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-asphalt-950/55">
          {isLoading
            ? 'Buscando...'
            : `${items.length} entrega${items.length === 1 ? '' : 's'} nesta página • ${total} no total`}
        </p>
        <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Atualizar
        </Button>
      </div>

      {actionError ? (
        <Alert tone="warn" title={actionError.title}>
          {actionError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-12 text-asphalt-950/70">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold">Carregando entregas disponíveis...</p>
          </div>
        </Card>
      ) : error ? (
        <Alert tone="danger" title={error.title}>
          {error.message}
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </Alert>
      ) : items.length === 0 ? (
        <Card variant="paper" className="text-center">
          <div className="flex flex-col items-center gap-3 py-10">
            <BoxMark size={96} tone="paper" />
            <p className="text-base font-extrabold text-asphalt-950">
              Nenhuma entrega disponível agora.
            </p>
            <p className="max-w-md text-sm text-asphalt-950/65">
              Esta lista não atualiza sozinha. Toque em Atualizar para verificar novas
              solicitações.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {items.map((item) => {
              const isAccepting = acceptingId === item.id;
              return (
                <li key={item.id}>
                  <Card variant="white" className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white shadow-pop">
                        <Store className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-extrabold text-asphalt-950">
                          {item.store.name}
                        </p>
                        <p className="mt-0.5 inline-flex items-start gap-1.5 text-sm font-semibold text-asphalt-950/65">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                            aria-hidden="true"
                          />
                          {item.store.address}
                        </p>
                      </div>
                      <Badge tone="warn">Aguardando</Badge>
                    </div>
                    <p className="text-xs font-bold text-asphalt-950/55">
                      Criada em {formatInstant(item.created_at)} • expira em{' '}
                      {formatInstant(item.expires_at)}
                    </p>
                    <Button
                      onClick={() => void handleAccept(item.id)}
                      disabled={acceptingId !== null}
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Aceitando...
                        </>
                      ) : (
                        'Aceitar entrega'
                      )}
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs font-bold text-asphalt-950/55">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((value) => value + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
