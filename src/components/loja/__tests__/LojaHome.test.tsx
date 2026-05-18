import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthContext } from '@/types/auth';
import type { StoreDeliveryListResult } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listMyDeliveries: vi.fn(),
  };
});

vi.mock('@/lib/realtime', () => ({
  subscribeToStoreDeliveryBroadcast: vi.fn(() => vi.fn()),
}));

import { listMyDeliveries } from '@/lib/api';
import { subscribeToStoreDeliveryBroadcast } from '@/lib/realtime';

import { LojaHome } from '../LojaHome';

const listMock = vi.mocked(listMyDeliveries);
const subscribeStoreMock = vi.mocked(subscribeToStoreDeliveryBroadcast);
const forbiddenStoreTechnicalCopy =
  /backend|API|POST\s+\/api|\/api\/deliveries|contrato real|payload|refetch|REST/i;

const authContext: AuthContext = {
  authUserId: 'auth-store',
  user: {
    id: 'domain-store',
    auth_id: 'auth-store',
    email: 'loja@example.com',
    role: 'logista',
    status: 'ativo',
    approved_at: '2026-05-17T12:00:00.000Z',
    approved_by: null,
    created_at: '2026-05-17T12:00:00.000Z',
    updated_at: '2026-05-17T12:00:00.000Z',
  },
};

const pendingResult: StoreDeliveryListResult = {
  items: [
    {
      id: '99999999-9999-4999-8999-999999999999',
      destination_address: 'Rua Cliente, 42',
      notes: null,
      status: 'aguardando',
      created_at: '2026-05-17T12:00:00.000Z',
      expires_at: '2026-05-17T12:10:00.000Z',
      accepted_at: null,
      collected_at: null,
      in_transit_at: null,
      delivered_at: null,
      updated_at: '2026-05-17T12:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 6, total: 1 },
};

const acceptedResult: StoreDeliveryListResult = {
  items: [
    {
      ...pendingResult.items[0],
      status: 'aceita',
      accepted_at: '2026-05-17T12:01:00.000Z',
      updated_at: '2026-05-17T12:01:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 6, total: 1 },
};

beforeEach(() => {
  vi.clearAllMocks();
  subscribeStoreMock.mockReturnValue(vi.fn());
});

afterEach(() => {
  cleanup();
});

describe('LojaHome', () => {
  it('loads the store panel from the delivery list and tracks open deliveries', async () => {
    listMock.mockResolvedValue(pendingResult);

    const { container } = render(<LojaHome accessToken="tok" authContext={authContext} />);

    expect((await screen.findAllByText('Rua Cliente, 42')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aguardando').length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(forbiddenStoreTechnicalCopy);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(3);
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 6 });
    expect(subscribeStoreMock).toHaveBeenCalledWith(
      'tok',
      pendingResult.items[0].id,
      expect.any(Function),
      undefined,
      expect.any(Function),
    );
  });

  it('refreshes the panel when the tracked delivery is accepted', async () => {
    listMock.mockResolvedValueOnce(pendingResult).mockResolvedValueOnce(acceptedResult);

    render(<LojaHome accessToken="tok" authContext={authContext} />);

    expect((await screen.findAllByText('Aguardando')).length).toBeGreaterThan(0);

    const onChanged = subscribeStoreMock.mock.calls[0][2];
    await act(async () => {
      onChanged();
    });

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(await screen.findAllByText('Aceita')).not.toHaveLength(0);
    expect(screen.getByText(/aceita em/i)).toBeInTheDocument();
  });

  it('refreshes once when the store channel becomes ready to close the subscribe gap', async () => {
    listMock.mockResolvedValueOnce(pendingResult).mockResolvedValueOnce(acceptedResult);

    render(<LojaHome accessToken="tok" authContext={authContext} />);

    expect((await screen.findAllByText('Aguardando')).length).toBeGreaterThan(0);

    const onReady = subscribeStoreMock.mock.calls[0][4];
    await act(async () => {
      onReady?.();
    });

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(await screen.findAllByText('Aceita')).not.toHaveLength(0);
  });

  it('keeps the manual refresh button as a fallback', async () => {
    listMock.mockResolvedValueOnce(pendingResult).mockResolvedValueOnce(acceptedResult);

    render(<LojaHome accessToken="tok" authContext={authContext} />);

    expect((await screen.findAllByText('Aguardando')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Atualizar/i }));

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(await screen.findAllByText('Aceita')).not.toHaveLength(0);
  });
});
