import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DeliveryRequest } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    createDeliveryRequest: vi.fn(),
    getMyDelivery: vi.fn(),
  };
});

vi.mock('@/lib/realtime', () => ({
  subscribeToStoreDeliveryBroadcast: vi.fn(() => vi.fn()),
}));

const notificationMock = vi.hoisted(() => ({
  notify: vi.fn(),
}));

vi.mock('@/components/shell/InAppNotifications', () => ({
  useInAppNotifications: () => ({
    items: [],
    unreadCount: 0,
    notify: notificationMock.notify,
    clear: vi.fn(),
  }),
}));

import { createDeliveryRequest, getMyDelivery } from '@/lib/api';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';

import { NovaEntregaFlow } from '../NovaEntregaFlow';

const createMock = vi.mocked(createDeliveryRequest);
const getDetailMock = vi.mocked(getMyDelivery);
const subscribeStoreMock = vi.mocked(subscribeToStoreDeliveryBroadcast);

const createdDelivery: DeliveryRequest = {
  id: '99999999-9999-4999-8999-999999999999',
  destination_address: null,
  notes: null,
  status: 'aguardando',
  created_at: '2026-05-17T12:00:00.000Z',
  expires_at: '2026-05-17T12:10:00.000Z',
  accepted_at: null,
  collected_at: null,
  in_transit_at: null,
  delivered_at: null,
  updated_at: '2026-05-17T12:00:00.000Z',
  store: {
    name: 'Loja Cafe',
    address: 'Rua da Loja, 100',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  subscribeStoreMock.mockReturnValue(vi.fn());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('NovaEntregaFlow', () => {
  it('offers a clear CTA to the created delivery detail', async () => {
    createMock.mockResolvedValue(createdDelivery);

    const { container } = render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicita/i }));

    const detailLink = await screen.findByRole('link', { name: /Acompanhar entrega/i });
    expect(detailLink).toHaveAttribute('href', `/loja/entregas/${createdDelivery.id}`);
    expect(createMock).toHaveBeenCalledWith('tok', {});
    expect(screen.getByText(/Loja Cafe/)).toBeInTheDocument();
    expect(screen.getByText(/Rua da Loja, 100/)).toBeInTheDocument();
    expect(container.innerHTML).not.toContain('Sua loja');
    expect(container.innerHTML).not.toMatch(/store_id|courier_id|Authorization|Bearer/i);
  });

  it('refreshes the created card manually through the REST detail endpoint', async () => {
    createMock.mockResolvedValue(createdDelivery);
    getDetailMock.mockResolvedValue({
      ...createdDelivery,
      status: 'aceita',
      accepted_at: '2026-05-17T12:01:00.000Z',
      updated_at: '2026-05-17T12:01:00.000Z',
    });

    render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicita/i }));
    await userEvent.click(await screen.findByRole('button', { name: /Atualizar/i }));

    expect(getDetailMock).toHaveBeenCalledWith('tok', createdDelivery.id);
    expect(await screen.findByText('Status recebido do backend: aceita')).toBeInTheDocument();
  });

  it('uses delivery realtime only as a generic notification and REST refetch trigger', async () => {
    createMock.mockResolvedValue(createdDelivery);
    getDetailMock.mockResolvedValue({
      ...createdDelivery,
      status: 'coletada',
      accepted_at: '2026-05-17T12:01:00.000Z',
      collected_at: '2026-05-17T12:03:00.000Z',
      updated_at: '2026-05-17T12:03:00.000Z',
    });

    const { container } = render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicita/i }));
    expect(await screen.findByText(/Loja Cafe/)).toBeInTheDocument();
    expect(subscribeStoreMock).toHaveBeenCalledWith(
      'tok',
      createdDelivery.id,
      expect.any(Function),
    );

    const onChanged = subscribeStoreMock.mock.calls[0][2];
    await act(async () => {
      onChanged();
      onChanged();
    });

    await waitFor(() => expect(getDetailMock).toHaveBeenCalledTimes(1));
    expect(notificationMock.notify).toHaveBeenCalledTimes(1);
    expect(notificationMock.notify).toHaveBeenCalledWith('A entrega foi atualizada.');
    expect(await screen.findByText('Status recebido do backend: coletada')).toBeInTheDocument();

    const realtimeAlert = screen.getByText('A entrega foi atualizada.').closest('[role="alert"]');
    expect(realtimeAlert).not.toBeNull();
    expect(
      within(realtimeAlert as HTMLElement).getByText('A entrega foi atualizada.'),
    ).toBeInTheDocument();
    expect((realtimeAlert as HTMLElement).innerHTML).not.toMatch(
      /99999999|deliveryId|status|address|destination_address|notes|store_id|courier_id|user_id|auth_id|Authorization|Bearer|service_role|token|email|phone|Rua da Loja|Loja Cafe/i,
    );
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|user_id|auth_id|Authorization|Bearer|service_role|token/i,
    );
  });

  it('cleans the delivery subscription and timers when leaving the created state', async () => {
    const unsubscribe = vi.fn();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    subscribeStoreMock.mockReturnValue(unsubscribe);
    createMock.mockResolvedValue(createdDelivery);
    getDetailMock.mockResolvedValue(createdDelivery);

    render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicita/i }));
    const onChanged = subscribeStoreMock.mock.calls[0][2];
    await act(async () => {
      onChanged();
    });
    await userEvent.click(await screen.findByRole('button', { name: /Criar outra/i }));

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('ignores a pending refresh after leaving the created state', async () => {
    let resolveRefresh: (delivery: DeliveryRequest) => void = () => {};
    const pendingRefresh = new Promise<DeliveryRequest>((resolve) => {
      resolveRefresh = resolve;
    });
    createMock.mockResolvedValue(createdDelivery);
    getDetailMock.mockReturnValue(pendingRefresh);

    render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicita/i }));
    await userEvent.click(await screen.findByRole('button', { name: /Atualizar/i }));
    await userEvent.click(screen.getByRole('button', { name: /Criar outra/i }));

    await act(async () => {
      resolveRefresh({
        ...createdDelivery,
        status: 'aceita',
        accepted_at: '2026-05-17T12:01:00.000Z',
      });
      await pendingRefresh;
    });

    expect(screen.getByRole('button', { name: /Criar solicita/i })).toBeInTheDocument();
    expect(screen.queryByText('Status recebido do backend: aceita')).not.toBeInTheDocument();
  });

  it('explains that store name and pickup address come from the store profile', () => {
    render(<NovaEntregaFlow accessToken="tok" />);

    expect(screen.getByText('Sobre a loja e a coleta')).toBeInTheDocument();
    expect(
      screen.getByText(/Nome da loja e endereco de coleta vem do perfil cadastrado/i),
    ).toBeInTheDocument();
  });
});
