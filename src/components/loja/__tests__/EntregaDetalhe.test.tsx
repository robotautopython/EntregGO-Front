import { cleanup, render, screen, within } from '@testing-library/react';
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

import { getMyDelivery } from '@/lib/api';

import { EntregaDetalhe } from '../EntregaDetalhe';

const getDetailMock = vi.mocked(getMyDelivery);

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
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
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
    expect(screen.getAllByText('Aceita').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coletada').length).toBeGreaterThan(0);
    expect(getDetailMock).toHaveBeenCalledWith('tok', detail.id);
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|owner_name|full_name|logo_url|bike_photo_url|license_photo_url|Authorization|Bearer/i,
    );
  });

  it('refreshes manually without polling', async () => {
    getDetailMock
      .mockResolvedValueOnce(detail)
      .mockResolvedValueOnce({
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

  it('shows a recoverable error and retries', async () => {
    getDetailMock
      .mockRejectedValueOnce(new ClientApiError('DELIVERY_GET_FAILED', 'falhou'))
      .mockResolvedValueOnce(detail);

    render(<EntregaDetalhe accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByText(/Não foi possível carregar a entrega/i),
    ).toBeInTheDocument();

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
