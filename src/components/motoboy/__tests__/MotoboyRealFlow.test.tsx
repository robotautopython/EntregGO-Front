import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { CourierOperationalStatus } from '@/types/auth';
import type {
  AcceptedDelivery,
  ActiveDelivery,
  AvailableDeliveriesResult,
} from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    getCourierStatus: vi.fn(),
    updateCourierStatus: vi.fn(),
    updateDeliveryStatus: vi.fn(),
    getActiveDelivery: vi.fn(),
    listAvailableDeliveries: vi.fn(),
    acceptDelivery: vi.fn(),
  };
});

vi.mock('@/lib/realtime', () => ({
  subscribeToAvailableDeliveriesBroadcast: vi.fn(() => vi.fn()),
}));

import {
  acceptDelivery,
  getActiveDelivery,
  getCourierStatus,
  listAvailableDeliveries,
  updateCourierStatus,
  updateDeliveryStatus,
} from '@/lib/api';

import { MotoboyRealFlow } from '../MotoboyRealFlow';

const statusMock = vi.mocked(getCourierStatus);
const updateStatusMock = vi.mocked(updateCourierStatus);
const updateDeliveryStatusMock = vi.mocked(updateDeliveryStatus);
const activeMock = vi.mocked(getActiveDelivery);
const listMock = vi.mocked(listAvailableDeliveries);
const acceptMock = vi.mocked(acceptDelivery);

const onlineStatus: CourierOperationalStatus = {
  is_online: true,
  updated_at: '2026-05-16T12:00:00.000Z',
};

const offlineStatus: CourierOperationalStatus = {
  is_online: false,
  updated_at: '2026-05-16T12:00:00.000Z',
};

const activeDelivery: ActiveDelivery = {
  id: 'd1',
  destination_address: 'Rua Destino, 50',
  notes: 'Levar na portaria',
  status: 'aceita',
  accepted_at: '2026-05-16T12:00:20.000Z',
  created_at: '2026-05-16T12:00:00.000Z',
  expires_at: '2026-05-16T12:01:00.000Z',
  store: { name: 'Loja Alpha', address: 'Rua A, 1' },
};

const acceptedDelivery: AcceptedDelivery = {
  id: activeDelivery.id,
  status: 'aceita',
  accepted_at: activeDelivery.accepted_at ?? '2026-05-16T12:00:20.000Z',
  created_at: activeDelivery.created_at,
  expires_at: activeDelivery.expires_at,
  store: activeDelivery.store,
};

const availableResult: AvailableDeliveriesResult = {
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
};

beforeEach(() => {
  vi.clearAllMocks();
  statusMock.mockResolvedValue(onlineStatus);
});

afterEach(() => {
  cleanup();
});

describe('MotoboyRealFlow', () => {
  it('renders the available queue when there is no active delivery', async () => {
    activeMock.mockResolvedValue(null);
    listMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByText(/Nenhuma entrega/i)).toBeInTheDocument();
    expect(statusMock).toHaveBeenCalledWith('tok');
    expect(activeMock).toHaveBeenCalledWith('tok');
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });
  });

  it('renders the active delivery with the next transition action when one exists', async () => {
    activeMock.mockResolvedValue(activeDelivery);

    const { container } = render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByRole('heading', { name: 'Corrida em andamento' })).toBeInTheDocument();
    expect(screen.getByText('Nome da loja')).toBeInTheDocument();
    expect(screen.getAllByText('Loja Alpha').length).toBeGreaterThan(0);
    expect(screen.getByText('Endereco de coleta')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 1')).toBeInTheDocument();
    expect(screen.getByText('Rua Destino, 50')).toBeInTheDocument();
    expect(screen.getByText('Levar na portaria')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar coleta' })).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/store_id|courier_id|collected_at|in_transit_at|delivered_at/);
  });

  it('does not render destination placeholders when destination address is absent', async () => {
    activeMock.mockResolvedValue({
      ...activeDelivery,
      destination_address: null,
      notes: null,
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByRole('heading', { name: 'Corrida em andamento' })).toBeInTheDocument();
    expect(screen.getByText('Nome da loja')).toBeInTheDocument();
    expect(screen.getAllByText('Loja Alpha').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Destino nao informado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Endereco nao informado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Entrega$/)).not.toBeInTheDocument();
  });

  it('does not render observations when notes are blank', async () => {
    activeMock.mockResolvedValue({
      ...activeDelivery,
      notes: '   ',
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByRole('heading', { name: 'Corrida em andamento' })).toBeInTheDocument();
    expect(screen.getByText('Nome da loja')).toBeInTheDocument();
    expect(screen.getByText('Endereco de coleta')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 1')).toBeInTheDocument();
    expect(screen.queryByText('Observacao da loja')).not.toBeInTheDocument();
  });

  it('does not render map actions when every address is absent', async () => {
    activeMock.mockResolvedValue({
      ...activeDelivery,
      destination_address: '   ',
      notes: null,
      store: { name: 'Loja Sem Endereco', address: '' },
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByRole('heading', { name: 'Corrida em andamento' })).toBeInTheDocument();
    expect(screen.getByText('Loja Sem Endereco')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Abrir no mapa/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Destino nao informado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Endereco nao informado/i)).not.toBeInTheDocument();
  });

  it('loads the real active delivery after a successful accept', async () => {
    activeMock.mockResolvedValueOnce(null).mockResolvedValueOnce(activeDelivery);
    listMock.mockResolvedValue(availableResult);
    acceptMock.mockResolvedValue(acceptedDelivery);

    render(<MotoboyRealFlow accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar entrega' }));

    expect(await screen.findByRole('heading', { name: 'Corrida em andamento' })).toBeInTheDocument();
    expect(screen.getByText('Rua Destino, 50')).toBeInTheDocument();
    await waitFor(() => expect(activeMock).toHaveBeenCalledTimes(2));
  });

  it('advances the active delivery status and shows the next action', async () => {
    activeMock.mockResolvedValue(activeDelivery);
    updateDeliveryStatusMock.mockResolvedValue({
      ...activeDelivery,
      status: 'coletada',
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar coleta' }));

    expect(updateDeliveryStatusMock).toHaveBeenCalledWith('tok', activeDelivery.id, 'coletada');
    expect(await screen.findByText('Coletada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar transito' })).toBeInTheDocument();
  });

  it('blocks double-click while a delivery status transition is pending', async () => {
    activeMock.mockResolvedValue(activeDelivery);
    let resolveUpdate!: (value: Awaited<ReturnType<typeof updateDeliveryStatus>>) => void;
    updateDeliveryStatusMock.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof updateDeliveryStatus>>>((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    render(<MotoboyRealFlow accessToken="tok" />);

    const btn = await screen.findByRole('button', { name: 'Confirmar coleta' });
    await userEvent.click(btn);
    await userEvent.click(btn).catch(() => {});

    expect(updateDeliveryStatusMock).toHaveBeenCalledTimes(1);
    resolveUpdate({
      ...activeDelivery,
      status: 'coletada',
    });
    expect(await screen.findByText('Coletada')).toBeInTheDocument();
  });

  it('removes the active delivery after concluding it', async () => {
    activeMock.mockResolvedValue({
      ...activeDelivery,
      status: 'em_transito',
    });
    updateDeliveryStatusMock.mockResolvedValue({
      ...activeDelivery,
      status: 'entregue',
    });
    listMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Concluir entrega' }));

    expect(updateDeliveryStatusMock).toHaveBeenCalledWith('tok', activeDelivery.id, 'entregue');
    expect(await screen.findByText(/Nenhuma entrega/i)).toBeInTheDocument();
  });

  it('shows a recoverable delivery-status error', async () => {
    activeMock.mockResolvedValue(activeDelivery);
    updateDeliveryStatusMock.mockRejectedValue(
      new ClientApiError('INVALID_DELIVERY_TRANSITION', 'srv'),
    );

    render(<MotoboyRealFlow accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar coleta' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Etapa invalida/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar coleta' })).toBeInTheDocument();
  });

  it('shows a recoverable active-delivery error', async () => {
    activeMock.mockRejectedValue(new ClientApiError('COURIER_OFFLINE', 'srv'));

    render(<MotoboyRealFlow accessToken="tok" />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/offline/i)).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    expect(listMock).not.toHaveBeenCalled();
  });

  it('does not load active delivery or queue while the courier is offline', async () => {
    statusMock.mockResolvedValue(offlineStatus);

    render(<MotoboyRealFlow accessToken="tok" />);

    expect(await screen.findByRole('button', { name: 'Ficar online' })).toBeInTheDocument();
    expect(screen.getByText(/Enquanto estiver offline/i)).toBeInTheDocument();
    expect(activeMock).not.toHaveBeenCalled();
    expect(listMock).not.toHaveBeenCalled();
  });

  it('loads active delivery and queue after the courier goes online', async () => {
    statusMock.mockResolvedValue(offlineStatus);
    updateStatusMock.mockResolvedValue(onlineStatus);
    activeMock.mockResolvedValue(null);
    listMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    render(<MotoboyRealFlow accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ficar online' }));

    expect(updateStatusMock).toHaveBeenCalledWith('tok', true);
    expect(await screen.findByText(/Nenhuma entrega/i)).toBeInTheDocument();
    await waitFor(() => expect(activeMock).toHaveBeenCalledWith('tok'));
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20 });
  });
});
