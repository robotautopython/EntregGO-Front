import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { CourierDeliveryHistoryDetail } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    getCourierHistoryDelivery: vi.fn(),
  };
});

import { getCourierHistoryDelivery } from '@/lib/api';

import { HistoricoMotoboyDetalhe } from '../HistoricoMotoboyDetalhe';

const getDetailMock = vi.mocked(getCourierHistoryDelivery);

const detail: CourierDeliveryHistoryDetail = {
  id: '77777777-7777-4777-8777-777777777777',
  destination_address: 'Rua Destino, 99',
  notes: 'Deixar na recepção',
  status: 'entregue',
  created_at: '2026-05-17T12:00:00.000Z',
  expires_at: '2026-05-17T12:10:00.000Z',
  accepted_at: '2026-05-17T12:01:00.000Z',
  collected_at: '2026-05-17T12:03:00.000Z',
  in_transit_at: '2026-05-17T12:05:00.000Z',
  delivered_at: '2026-05-17T12:12:00.000Z',
  updated_at: '2026-05-17T12:12:00.000Z',
  store: { name: 'Loja Cafe', address: 'Rua Loja, 10' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('HistoricoMotoboyDetalhe', () => {
  it('shows a loading state while the detail request is pending', () => {
    getDetailMock.mockReturnValue(new Promise<CourierDeliveryHistoryDetail>(() => undefined));

    render(<HistoricoMotoboyDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(screen.getByText('Carregando corrida...')).toBeInTheDocument();
  });

  it('loads the real history detail and keeps forbidden fields out of the UI', async () => {
    getDetailMock.mockResolvedValue(detail);

    const { container } = render(
      <HistoricoMotoboyDetalhe accessToken="tok" deliveryId={detail.id} />,
    );

    expect(await screen.findByRole('heading', { name: 'Entregue' })).toBeInTheDocument();
    expect(screen.getByText('Loja Cafe')).toBeInTheDocument();
    expect(screen.getByText('Rua Loja, 10')).toBeInTheDocument();
    expect(screen.getByText('Rua Destino, 99')).toBeInTheDocument();
    expect(screen.getByText('Deixar na recepção')).toBeInTheDocument();
    expect(screen.getByText('Timestamps operacionais')).toBeInTheDocument();
    expect(screen.getAllByText('Coletada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em trânsito').length).toBeGreaterThan(0);
    expect(getDetailMock).toHaveBeenCalledWith('tok', detail.id);
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|owner_name|full_name|logo_url|bike_photo_url|license_photo_url|email|auth_id|Authorization|Bearer|token/i,
    );
  });

  it('shows a recoverable error and retries manually', async () => {
    getDetailMock
      .mockRejectedValueOnce(new ClientApiError('DELIVERY_HISTORY_GET_FAILED', 'falhou'))
      .mockResolvedValueOnce(detail);

    render(<HistoricoMotoboyDetalhe accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByText(/Não foi possível carregar a corrida/i),
    ).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByRole('heading', { name: 'Entregue' })).toBeInTheDocument();
    expect(getDetailMock).toHaveBeenCalledTimes(2);
  });

  it('maps auth and role failures to a recoverable state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('FORBIDDEN_ROLE', 'role errada'));

    render(<HistoricoMotoboyDetalhe accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Permissão negada/i)).toBeInTheDocument();
    expect(
      within(alert).getByText(/Somente um motoboy ativo pode abrir esta corrida/i),
    ).toBeInTheDocument();
  });

  it('shows an honest not found state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('DELIVERY_NOT_FOUND', 'não encontrada'));

    render(<HistoricoMotoboyDetalhe accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByText('Corrida não encontrada')).toBeInTheDocument();
    expect(screen.getByText(/não pertence ao seu histórico/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver histórico/i })).toHaveAttribute(
      'href',
      '/motoboy/historico',
    );
  });
});
