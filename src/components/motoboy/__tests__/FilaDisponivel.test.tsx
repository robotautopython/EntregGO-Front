import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { AvailableDeliveriesResult } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listAvailableDeliveries: vi.fn(),
    acceptDelivery: vi.fn(),
  };
});

import { acceptDelivery, listAvailableDeliveries } from '@/lib/api';

import { FilaDisponivel } from '../FilaDisponivel';

const listMock = vi.mocked(listAvailableDeliveries);
const acceptMock = vi.mocked(acceptDelivery);

function makeResult(overrides?: Partial<AvailableDeliveriesResult>): AvailableDeliveriesResult {
  return {
    items: [
      {
        id: 'd1',
        status: 'aguardando',
        created_at: '2026-05-16T12:00:00.000Z',
        expires_at: '2026-05-16T12:01:00.000Z',
        store: { name: 'Loja Alpha', address: 'Rua A, 1' },
      },
    ],
    pagination: { page: 1, limit: 20, total: 1 },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('FilaDisponivel', () => {
  it('shows the loading state first', () => {
    listMock.mockReturnValue(new Promise(() => {}));
    render(<FilaDisponivel accessToken="tok" />);
    expect(screen.getByText('Carregando entregas disponíveis...')).toBeInTheDocument();
  });

  it('renders an honest empty state', async () => {
    listMock.mockResolvedValue(makeResult({ items: [], pagination: { page: 1, limit: 20, total: 0 } }));
    render(<FilaDisponivel accessToken="tok" />);
    expect(await screen.findByText('Nenhuma entrega disponível agora.')).toBeInTheDocument();
  });

  it('renders only store name/address and no third-party PII', async () => {
    listMock.mockResolvedValue(makeResult());
    const { container } = render(<FilaDisponivel accessToken="tok" />);
    expect(await screen.findByText('Loja solicitante')).toBeInTheDocument();
    expect(screen.getByText('Loja Alpha')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 1')).toBeInTheDocument();
    const html = container.innerHTML;
    expect(html).not.toMatch(/destination_address|notes|store_id|courier_id/);
  });

  it('keeps the store requester visible without rendering a missing address', async () => {
    listMock.mockResolvedValue(
      makeResult({
        items: [
          {
            id: 'd1',
            status: 'aguardando',
            created_at: '2026-05-16T12:00:00.000Z',
            expires_at: '2026-05-16T12:01:00.000Z',
            store: { name: 'Loja Sem Endereco', address: '' },
          },
        ],
      }),
    );

    const { container } = render(<FilaDisponivel accessToken="tok" />);

    expect(await screen.findByText('Loja solicitante')).toBeInTheDocument();
    expect(screen.getByText('Loja Sem Endereco')).toBeInTheDocument();
    expect(screen.queryByText(/Endereco nao informado/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/destination_address|notes|store_id|courier_id/);
  });

  it('does not render an address line on the fallback accepted state when it is absent', async () => {
    listMock.mockResolvedValue(makeResult());
    acceptMock.mockResolvedValue({
      id: 'd1',
      status: 'aceita',
      accepted_at: '2026-05-16T12:00:20.000Z',
      created_at: '2026-05-16T12:00:00.000Z',
      expires_at: '2026-05-16T12:01:00.000Z',
      store: { name: 'Loja Sem Endereco', address: '   ' },
    });

    render(<FilaDisponivel accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar entrega' }));

    expect(await screen.findByText('Entrega aceita')).toBeInTheDocument();
    expect(screen.getByText('Loja solicitante')).toBeInTheDocument();
    expect(screen.getByText('Loja Sem Endereco')).toBeInTheDocument();
    expect(screen.queryByText(/Endereco nao informado/i)).not.toBeInTheDocument();
  });

  it('renders a provided store address in the available queue', async () => {
    listMock.mockResolvedValue(makeResult());
    render(<FilaDisponivel accessToken="tok" />);
    expect(await screen.findByText('Loja Alpha')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 1')).toBeInTheDocument();
  });

  it('Atualizar triggers a fresh request', async () => {
    listMock.mockResolvedValue(makeResult());
    render(<FilaDisponivel accessToken="tok" />);
    await screen.findByText('Loja Alpha');
    expect(listMock).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: /Atualizar/i }));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
  });

  it('only sends page and limit to the list endpoint', async () => {
    listMock.mockResolvedValue(makeResult());
    render(<FilaDisponivel accessToken="tok" />);
    await screen.findByText('Loja Alpha');
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });
  });

  it('blocks double-click on Aceitar (single accept call)', async () => {
    listMock.mockResolvedValue(makeResult());
    let resolveAccept!: (value: Awaited<ReturnType<typeof acceptDelivery>>) => void;
    acceptMock.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof acceptDelivery>>>((resolve) => {
        resolveAccept = resolve;
      }),
    );
    render(<FilaDisponivel accessToken="tok" />);
    const btn = await screen.findByRole('button', { name: 'Aceitar entrega' });
    await userEvent.click(btn);
    await userEvent.click(btn).catch(() => {});
    expect(acceptMock).toHaveBeenCalledTimes(1);
    resolveAccept({
      id: 'd1',
      status: 'aceita',
      accepted_at: '2026-05-16T12:00:20.000Z',
      created_at: '2026-05-16T12:00:00.000Z',
      expires_at: '2026-05-16T12:01:00.000Z',
      store: { name: 'Loja Alpha', address: 'Rua A, 1' },
    });
    expect(await screen.findByText('Entrega aceita')).toBeInTheDocument();
  });

  it('removes the item and warns on ALREADY_ACCEPTED', async () => {
    listMock.mockResolvedValueOnce(makeResult());
    acceptMock.mockRejectedValueOnce(new ClientApiError('ALREADY_ACCEPTED', 'srv'));
    listMock.mockResolvedValueOnce(makeResult({ items: [], pagination: { page: 1, limit: 20, total: 0 } }));
    render(<FilaDisponivel accessToken="tok" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar entrega' }));
    expect(await screen.findByText('Entrega já aceita')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Nenhuma entrega disponível agora.')).toBeInTheDocument(),
    );
    expect(listMock).toHaveBeenCalledTimes(2);
  });

  it('disables pagination at the boundaries', async () => {
    listMock.mockResolvedValue(makeResult());
    render(<FilaDisponivel accessToken="tok" />);
    await screen.findByText('Loja Alpha');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('shows a recoverable error with retry', async () => {
    listMock.mockRejectedValueOnce(new ClientApiError('COURIER_OFFLINE', 'srv'));
    render(<FilaDisponivel accessToken="tok" />);
    expect(await screen.findByText('Você está offline')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
  });
});
