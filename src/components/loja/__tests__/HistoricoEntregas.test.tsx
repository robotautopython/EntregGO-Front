import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { StoreDeliveryListResult } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listMyDeliveries: vi.fn(),
  };
});

import { listMyDeliveries } from '@/lib/api';

import { HistoricoEntregas } from '../HistoricoEntregas';

const listMock = vi.mocked(listMyDeliveries);

const history: StoreDeliveryListResult = {
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

describe('HistoricoEntregas', () => {
  it('opens a specific delivery from the real history list', async () => {
    listMock.mockResolvedValue(history);

    const { container } = render(<HistoricoEntregas accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: /Rua Cliente, 42/i }));

    const link = await screen.findByRole('link', { name: /Abrir entrega/i });
    expect(link).toHaveAttribute('href', `/loja/entregas/${history.items[0].id}`);
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });
    expect(container.innerHTML).not.toMatch(/store_id|courier_id|Authorization|Bearer/i);
  });

  it('keeps status filtering scoped to the list endpoint', async () => {
    listMock.mockResolvedValue({ items: [], pagination: { page: 1, limit: 20, total: 0 } });

    render(<HistoricoEntregas accessToken="tok" />);

    await screen.findByText('Nada por aqui ainda.');
    await userEvent.click(screen.getByRole('button', { name: 'Entregue' }));

    expect(await screen.findByText('Nenhuma entrega com esse status.')).toBeInTheDocument();
    expect(listMock).toHaveBeenLastCalledWith('tok', {
      page: 1,
      limit: 20,
      status: 'entregue',
    });
  });
});
