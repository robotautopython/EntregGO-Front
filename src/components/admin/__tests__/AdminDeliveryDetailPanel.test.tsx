import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientApiError } from '@/lib/api';
import type { AdminDeliveryDetail } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    getAdminDelivery: vi.fn(),
  };
});

import { getAdminDelivery } from '@/lib/api';

import { AdminDeliveryDetailPanel } from '../AdminDeliveryDetailPanel';

const getDetailMock = vi.mocked(getAdminDelivery);

const detail: AdminDeliveryDetail = {
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminDeliveryDetailPanel', () => {
  it('shows a loading state while the detail request is pending', () => {
    getDetailMock.mockReturnValue(new Promise<AdminDeliveryDetail>(() => undefined));

    render(<AdminDeliveryDetailPanel accessToken="tok" deliveryId={detail.id} />);

    expect(screen.getByText('Carregando entrega...')).toBeInTheDocument();
  });

  it('loads the real admin delivery detail and keeps forbidden fields out of the UI', async () => {
    getDetailMock.mockResolvedValue(detail);

    const { container } = render(
      <AdminDeliveryDetailPanel accessToken="tok" deliveryId={detail.id} />,
    );

    expect(await screen.findByRole('heading', { name: 'Em transito' })).toBeInTheDocument();
    expect(screen.getByText('Loja Teste')).toBeInTheDocument();
    expect(screen.getByText('Rua Loja, 123')).toBeInTheDocument();
    expect(screen.getByText('Rua Cliente, 42')).toBeInTheDocument();
    expect(screen.getByText('Entregar na portaria')).toBeInTheDocument();
    expect(screen.getByText('Timestamps operacionais')).toBeInTheDocument();
    expect(getDetailMock).toHaveBeenCalledWith('tok', detail.id);
    expect(container.innerHTML).not.toMatch(
      /store_id|courier_id|user_id|auth_id|owner_name|full_name|logo_url|description|bike_photo_url|license_photo_url|email|Authorization|Bearer|token/i,
    );
  });

  it('shows a recoverable error and retries manually', async () => {
    getDetailMock
      .mockRejectedValueOnce(new ClientApiError('ADMIN_DELIVERY_GET_FAILED', 'falhou'))
      .mockResolvedValueOnce(detail);

    render(<AdminDeliveryDetailPanel accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Nao foi possivel carregar a entrega/i)).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByRole('heading', { name: 'Em transito' })).toBeInTheDocument();
    expect(getDetailMock).toHaveBeenCalledTimes(2);
  });

  it('maps auth and role failures to a recoverable state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('FORBIDDEN_ROLE', 'role errada'));

    render(<AdminDeliveryDetailPanel accessToken="tok" deliveryId={detail.id} />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Permissao negada/i)).toBeInTheDocument();
    expect(
      within(alert).getByText(/Somente administradores ativos podem abrir esta entrega/i),
    ).toBeInTheDocument();
  });

  it('shows an honest not found state', async () => {
    getDetailMock.mockRejectedValue(new ClientApiError('DELIVERY_NOT_FOUND', 'nao encontrada'));

    render(<AdminDeliveryDetailPanel accessToken="tok" deliveryId={detail.id} />);

    expect(await screen.findByText('Entrega nao encontrada')).toBeInTheDocument();
    expect(screen.getByText(/ainda nao estar disponivel/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver entregas/i })).toHaveAttribute(
      'href',
      '/admin/entregas',
    );
  });
});
