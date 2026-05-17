import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminDeliveriesResult } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listAdminDeliveries: vi.fn(),
  };
});

import { ClientApiError, listAdminDeliveries } from '@/lib/api';

import { AdminDeliveriesPanel } from '../AdminDeliveriesPanel';

const listMock = vi.mocked(listAdminDeliveries);

const result: AdminDeliveriesResult = {
  items: [
    {
      id: '88888888-8888-4888-8888-888888888888',
      destination_address: 'Rua Cliente, 42',
      notes: 'Entregar na portaria',
      status: 'em_transito',
      created_at: '2026-05-17T12:00:00.000Z',
      expires_at: '2026-05-17T12:10:00.000Z',
      accepted_at: '2026-05-17T12:01:00.000Z',
      collected_at: '2026-05-17T12:03:00.000Z',
      in_transit_at: '2026-05-17T12:06:00.000Z',
      delivered_at: null,
      updated_at: '2026-05-17T12:06:00.000Z',
      store: {
        name: 'Loja Teste',
        address: 'Rua Loja, 123',
      },
    },
  ],
  pagination: { page: 1, limit: 20, total: 1 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminDeliveriesPanel', () => {
  it('renders the real admin delivery list without forbidden fields', async () => {
    listMock.mockResolvedValue(result);

    const { container } = render(<AdminDeliveriesPanel accessToken="tok" />);

    expect(await screen.findByText('Loja Teste')).toBeInTheDocument();
    expect(screen.getByText('Rua Cliente, 42')).toBeInTheDocument();
    expect(screen.getByText('Entregar na portaria')).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });

    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|owner_name|logo_url|description|full_name|email|auth_id|Authorization|Bearer|token/i,
    );
  });

  it('requests the selected status filter and resets to the first page', async () => {
    listMock.mockResolvedValue({ items: [], pagination: { page: 1, limit: 20, total: 0 } });

    render(<AdminDeliveriesPanel accessToken="tok" />);

    await screen.findByText('Nada por aqui ainda.');
    await userEvent.click(screen.getByRole('button', { name: 'Entregue' }));

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', {
        page: 1,
        limit: 20,
        status: 'entregue',
      });
    });
    expect(await screen.findByText('Nenhuma entrega com esse status.')).toBeInTheDocument();
  });

  it('shows a recoverable error state', async () => {
    listMock.mockRejectedValue(
      new ClientApiError('ADMIN_DELIVERIES_LIST_FAILED', 'Listagem de entregas falhou'),
    );

    render(<AdminDeliveriesPanel accessToken="tok" />);

    expect(await screen.findByText('Listagem de entregas falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
  });

  it('uses pagination controls without adding unsupported query fields', async () => {
    listMock
      .mockResolvedValueOnce({
        ...result,
        pagination: { page: 1, limit: 20, total: 21 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 2, limit: 20, total: 21 },
      });

    render(<AdminDeliveriesPanel accessToken="tok" />);

    await screen.findByText('Loja Teste');
    await userEvent.click(screen.getByRole('button', { name: /Proxima/i }));

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', { page: 2, limit: 20 });
    });
  });
});
