import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { StoreDeliveryDetail } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    getMyDelivery: vi.fn(),
  };
});

vi.mock('@/lib/realtime', () => ({
  subscribeToStoreDeliveryBroadcast: vi.fn(() => vi.fn()),
}));

import { getMyDelivery } from '@/lib/api';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';

import { EntregaDetalhe } from '../EntregaDetalhe';

const getDetailMock = vi.mocked(getMyDelivery);
const subscribeStoreMock = vi.mocked(subscribeToStoreDeliveryBroadcast);
const forbiddenStoreTechnicalCopy =
  /backend|API|POST\s+\/api|\/api\/deliveries|contrato real|payload|refetch|REST/i;

const detail: StoreDeliveryDetail = {
  id: '77777777-7777-4777-8777-777777777777',
  destination_address: 'Rua Destino, 99',
  notes: 'Deixar na recepção',
  status: 'coletada',
  created_at: '2026-05-17T12:00:00.000Z',
  expires_at: '2026-05-17T12:10:00.000Z',
  accepted_at: '2026-05-17T12:01:00.000Z',
  collected_at: '2026-05-17T12:03:00.000Z',
  in_transit_at: null,
  delivered_at: null,
  updated_at: '2026-05-17T12:03:00.000Z',
  store: {
    name: 'Loja Cafe',
    address: 'Rua da Loja, 100',
  },
  courier: {
    full_name: 'Motoboy Parceiro',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  subscribeStoreMock.mockReturnValue(vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('EntregaDetalhe', () => {
  it('shows a loading state while the detail request is pending', () => {
    getDetailMock.mockReturnValue(new Promise<StoreDeliveryDetail>(() => undefined));

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(screen.getByText('Carregando entrega...')).toBeInTheDocument();
  });

  it('loads the real detail, renders the timeline and keeps forbidden fields out of the UI', async () => {
    getDetailMock.mockResolvedValue(detail);

    const { container } = render(
      <EntregaDetalhe accessToken="tok" deliveryId="77777777-7777-4777-8777-777777777777" />,
    );

    expect(await screen.findByRole('heading', { name: 'Coletada' })).toBeInTheDocument();
    expect(screen.getByText('Rua Destino, 99')).toBeInTheDocument();
    expect(screen.getByText('Deixar na recepção')).toBeInTheDocument();
    expect(screen.getByText('Solicitação criada')).toBeInTheDocument();
    expect(screen.getByText('Motoboy')).toBeInTheDocument();
    expect(screen.getByText('Motoboy Parceiro')).toBeInTheDocument();
    expect(screen.getByText('Aceita em')).toBeInTheDocument();
    expect(screen.getAllByText('Aceita').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coletada').length).toBeGreaterThan(0);
    expect(getDetailMock).toHaveBeenCalledWith('tok', detail.id);
    expect(container.textContent).not.toMatch(forbiddenStoreTechnicalCopy);
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|user_id|auth_id|email|phone|owner_name|full_name|is_online|logo_url|bike_photo_url|license_photo_url|Authorization|Bearer|service_role|token/i,
    );
  });

  it('keeps courier information hidden before acceptance', async () => {
    getDetailMock.mockResolvedValue({
      ...detail,
      status: 'aguardando',
      accepted_at: null,
      collected_at: null,
      courier: {
        full_name: 'Motoboy Parceiro',
      },
    });

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByRole('heading', { name: 'Aguardando' })).toBeInTheDocument();
    expect(screen.queryByText('Motoboy')).not.toBeInTheDocument();
    expect(screen.queryByText('Motoboy Parceiro')).not.toBeInTheDocument();
    expect(screen.queryByText('Aceita em')).not.toBeInTheDocument();
  });

  it('refreshes manually without polling', async () => {
    getDetailMock.mockResolvedValueOnce(detail).mockResolvedValueOnce({
      ...detail,
      status: 'em_transito',
      in_transit_at: '2026-05-17T12:08:00.000Z',
      updated_at: '2026-05-17T12:08:00.000Z',
    });

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByRole('heading', { name: 'Coletada' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Atualizar/i }));

    expect(await screen.findByRole('heading', { name: 'Em trânsito' })).toBeInTheDocument();
    expect(getDetailMock).toHaveBeenCalledTimes(2);
  });

  it('subscribes to delivery-specific realtime and coalesces accepted/status refetches', async () => {
    getDetailMock.mockResolvedValue(detail);

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByRole('heading', { name: 'Coletada' })).toBeInTheDocument();
    const onChanged = subscribeStoreMock.mock.calls[0][2];
    await act(async () => {
      onChanged();
      onChanged();
    });

    expect(screen.getByText('Entrega atualizada')).toBeInTheDocument();
    const realtimeAlert = screen.getByText('A entrega foi atualizada.').closest('[role="alert"]');
    expect(realtimeAlert).not.toBeNull();
    expect(
      within(realtimeAlert as HTMLElement).getByText('A entrega foi atualizada.'),
    ).toBeInTheDocument();
    expect((realtimeAlert as HTMLElement).innerHTML).not.toMatch(
      /77777777|deliveryId|status|address|destination_address|notes|store_id|courier_id|user_id|auth_id|full_name|Motoboy Parceiro|Authorization|Bearer|service_role|token|email|phone/i,
    );
    await waitFor(() => expect(getDetailMock).toHaveBeenCalledTimes(2));
    expect(subscribeStoreMock).toHaveBeenCalledWith(
      'tok',
      detail.id,
      expect.any(Function),
      undefined,
      expect.any(Function),
    );
  });

  it('unsubscribes from delivery realtime on unmount', async () => {
    const unsubscribe = vi.fn();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    subscribeStoreMock.mockReturnValue(unsubscribe);
    getDetailMock.mockResolvedValue(detail);

    const { unmount } = render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);
    expect(await screen.findByRole('heading', { name: 'Coletada' })).toBeInTheDocument();
    const onChanged = subscribeStoreMock.mock.calls[0][2];
    await act(async () => {
      onChanged();
    });
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('shows a recoverable error and retries', async () => {
    getDetailMock
      .mockRejectedValueOnce(new ClientApiError('DELIVERY_GET_FAILED', 'falhou'))
      .mockResolvedValueOnce(detail);

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Não foi possível carregar a entrega/i)).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByRole('heading', { name: 'Coletada' })).toBeInTheDocument();
    expect(getDetailMock).toHaveBeenCalledTimes(2);
  });

  it('maps auth and role failures to a recoverable session state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('FORBIDDEN_ROLE', 'role errada'));

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Permiss.o negada/i)).toBeInTheDocument();
    expect(
      within(alert).getByText(/Somente uma loja ativa pode abrir esta entrega/i),
    ).toBeInTheDocument();
  });

  it('shows an honest not found state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('DELIVERY_NOT_FOUND', 'não encontrada'));

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByText('Entrega não encontrada')).toBeInTheDocument();
    expect(screen.getByText(/não pertence à sua loja/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver histórico/i })).toHaveAttribute(
      'href',
      '/loja/historico',
    );
  });
});
