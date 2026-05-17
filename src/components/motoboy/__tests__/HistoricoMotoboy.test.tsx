import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { CourierDeliveryHistoryResult } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listCourierHistory: vi.fn(),
  };
});

import { listCourierHistory } from '@/lib/api';

import { HistoricoMotoboy } from '../HistoricoMotoboy';

const historyMock = vi.mocked(listCourierHistory);

const deliveredHistory: CourierDeliveryHistoryResult = {
  items: [
    {
      id: 'delivery-1',
      destination_address: 'Rua Destino, 99',
      notes: 'Deixar na recepcao',
      status: 'entregue',
      created_at: '2026-05-16T12:00:00.000Z',
      expires_at: '2026-05-16T12:10:00.000Z',
      accepted_at: '2026-05-16T12:01:00.000Z',
      collected_at: '2026-05-16T12:03:00.000Z',
      in_transit_at: '2026-05-16T12:05:00.000Z',
      delivered_at: '2026-05-16T12:12:00.000Z',
      updated_at: '2026-05-16T12:12:00.000Z',
      store: { name: 'Loja Cafe', address: 'Rua Loja, 10' },
    },
  ],
  pagination: { page: 1, limit: 20, total: 1 },
};

const emptyHistory: CourierDeliveryHistoryResult = {
  items: [],
  pagination: { page: 1, limit: 20, total: 0 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('HistoricoMotoboy', () => {
  it('renders real courier history and keeps forbidden fields out of the UI', async () => {
    historyMock.mockResolvedValue(deliveredHistory);

    const { container } = render(<HistoricoMotoboy accessToken="tok" />);

    expect(await screen.findByRole('heading', { name: 'Suas corridas' })).toBeInTheDocument();
    expect(screen.getByText('Loja Cafe')).toBeInTheDocument();
    expect(screen.getByText('Rua Destino, 99')).toBeInTheDocument();
    expect(screen.getAllByText('Entregue').length).toBeGreaterThan(0);
    expect(historyMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });

    const rowButton = screen.getByText('Loja Cafe').closest('button');
    expect(rowButton).not.toBeNull();
    await userEvent.click(rowButton as HTMLButtonElement);

    expect(await screen.findByText('Deixar na recepcao')).toBeInTheDocument();
    expect(screen.getAllByText('Coletada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em trânsito').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Abrir detalhe/i })).toHaveAttribute(
      'href',
      '/motoboy/historico/delivery-1',
    );
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|owner_name|logo_url|description|Authorization|Bearer/i,
    );
  });

  it('shows an honest empty state', async () => {
    historyMock.mockResolvedValue(emptyHistory);

    render(<HistoricoMotoboy accessToken="tok" />);

    expect(await screen.findByText('Nenhuma corrida encontrada.')).toBeInTheDocument();
    expect(screen.getByText(/Quando você aceitar uma entrega/i)).toBeInTheDocument();
  });

  it('shows a recoverable error and retries', async () => {
    historyMock
      .mockRejectedValueOnce(new ClientApiError('DELIVERY_HISTORY_LIST_FAILED', 'falhou'))
      .mockResolvedValueOnce(emptyHistory);

    render(<HistoricoMotoboy accessToken="tok" />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Não foi possível carregar o histórico/i)).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByText('Nenhuma corrida encontrada.')).toBeInTheDocument();
    expect(historyMock).toHaveBeenCalledTimes(2);
  });

  it('requests the selected status filter from the backend', async () => {
    historyMock.mockResolvedValue(emptyHistory);

    render(<HistoricoMotoboy accessToken="tok" />);

    await screen.findByText('Nenhuma corrida encontrada.');
    await userEvent.click(screen.getByRole('button', { name: 'Entregue' }));

    await waitFor(() =>
      expect(historyMock).toHaveBeenLastCalledWith('tok', {
        page: 1,
        limit: 20,
        status: 'entregue',
      }),
    );
  });

  it('paginates through the real API result', async () => {
    historyMock
      .mockResolvedValueOnce({
        ...deliveredHistory,
        pagination: { page: 1, limit: 20, total: 21 },
      })
      .mockResolvedValueOnce({
        items: [
          {
            ...deliveredHistory.items[0],
            id: 'delivery-2',
            store: { name: 'Loja Beta', address: 'Rua B, 2' },
          },
        ],
        pagination: { page: 2, limit: 20, total: 21 },
      });

    render(<HistoricoMotoboy accessToken="tok" />);

    expect(await screen.findByText('Loja Cafe')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(await screen.findByText('Loja Beta')).toBeInTheDocument();
    expect(historyMock).toHaveBeenLastCalledWith('tok', { page: 2, limit: 20 });
  });
});
