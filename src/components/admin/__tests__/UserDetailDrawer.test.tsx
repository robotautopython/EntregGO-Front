import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DomainUser } from '@/types/auth';
import type { AdminUserDeliveriesResult } from '@/types/delivery';
import type { AdminUserPaymentsResult } from '@/types/payment';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listAdminUserDeliveries: vi.fn(),
    listAdminUserPayments: vi.fn(),
  };
});

import { ClientApiError, listAdminUserDeliveries, listAdminUserPayments } from '@/lib/api';

import { UserDetailDrawer } from '../UserDetailDrawer';

const listMock = vi.mocked(listAdminUserDeliveries);
const paymentsMock = vi.mocked(listAdminUserPayments);

const storeUser: DomainUser = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  auth_id: 'auth-store',
  email: 'store@example.com',
  role: 'logista',
  status: 'ativo',
  approved_at: '2026-05-14T00:00:00.000Z',
  approved_by: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  created_at: '2026-05-14T00:00:00.000Z',
  updated_at: '2026-05-14T00:00:00.000Z',
};

const result: AdminUserDeliveriesResult = {
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
  pagination: { page: 1, limit: 10, total: 11 },
};

const paymentsResult: AdminUserPaymentsResult = {
  items: [
    {
      id: '99999999-9999-4999-8999-999999999999',
      reference_month: '2026-05',
      due_date: '2026-05-31',
      paid: false,
      paid_at: null,
      created_at: '2026-05-17T12:00:00.000Z',
      updated_at: '2026-05-17T12:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 10, total: 11 },
};

function renderDrawer(user: DomainUser = storeUser) {
  return render(
    <UserDetailDrawer
      accessToken="tok"
      user={user}
      detail={null}
      isLoadingDetail={false}
      detailError={null}
      currentUserId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      activeAction={null}
      onClose={vi.fn()}
      onAction={vi.fn()}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('UserDetailDrawer deliveries tab', () => {
  it('loads user deliveries lazily and keeps forbidden fields out of the deliveries section', async () => {
    listMock.mockResolvedValue(result);

    renderDrawer();

    expect(listMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Entregas/i }));

    const section = await screen.findByRole('region', { name: /Entregas do usuario/i });

    expect(await within(section).findByText('Loja Teste')).toBeInTheDocument();
    expect(within(section).getByText('Rua Cliente, 42')).toBeInTheDocument();
    expect(within(section).getByText('Entregar na portaria')).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledWith('tok', storeUser.id, { page: 1, limit: 10 });
    expect(section.innerHTML).not.toMatch(
      /store_id|courier_id|user_id|auth_id|owner_name|full_name|logo_url|description|bike_photo_url|license_photo_url|email|Authorization|Bearer|token/i,
    );
  });

  it('sends only supported pagination and status params', async () => {
    listMock
      .mockResolvedValueOnce(result)
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 2, limit: 10, total: 11 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

    renderDrawer();
    await userEvent.click(screen.getByRole('button', { name: /Entregas/i }));
    await screen.findByText('Loja Teste');

    await userEvent.click(screen.getByRole('button', { name: /Proxima/i }));
    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', storeUser.id, { page: 2, limit: 10 });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Entregue' }));
    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', storeUser.id, {
        page: 1,
        limit: 10,
        status: 'entregue',
      });
    });
  });

  it('shows recoverable error and empty states', async () => {
    listMock.mockRejectedValueOnce(
      new ClientApiError('ADMIN_USER_DELIVERIES_LIST_FAILED', 'falhou'),
    );

    renderDrawer();
    await userEvent.click(screen.getByRole('button', { name: /Entregas/i }));

    expect(await screen.findByText('falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();

    listMock.mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0 } });
    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByText('Nenhuma entrega encontrada.')).toBeInTheDocument();
  });
});

describe('UserDetailDrawer payments tab', () => {
  it('loads user payments lazily and keeps forbidden fields out of the payments section', async () => {
    paymentsMock.mockResolvedValue(paymentsResult);

    renderDrawer();

    expect(paymentsMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Pagamento/i }));

    const section = await screen.findByRole('region', { name: /Pagamentos do usuario/i });

    expect(await within(section).findByText('99999999-9999-4999-8999-999999999999')).toBeInTheDocument();
    expect(within(section).getByText('05/2026')).toBeInTheDocument();
    expect(within(section).getByText('31/05/2026')).toBeInTheDocument();
    expect(paymentsMock).toHaveBeenCalledWith('tok', storeUser.id, { page: 1, limit: 10 });
    expect(section.innerHTML).not.toMatch(
      /user_id|auth_id|owner_name|full_name|marked_by|approved_by|amount|paymentMethod|payment_method|receipt|bankData|Authorization|Bearer|token|email|users/i,
    );
    expect(within(section).queryByRole('button', { name: /Marcar pago/i })).not.toBeInTheDocument();
  });

  it('sends only supported payment pagination and paid params', async () => {
    paymentsMock
      .mockResolvedValueOnce(paymentsResult)
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 2, limit: 10, total: 11 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

    renderDrawer();
    await userEvent.click(screen.getByRole('button', { name: /Pagamento/i }));
    await screen.findByText('05/2026');

    await userEvent.click(screen.getByRole('button', { name: /Proxima/i }));
    await waitFor(() => {
      expect(paymentsMock).toHaveBeenLastCalledWith('tok', storeUser.id, { page: 2, limit: 10 });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Pagos' }));
    await waitFor(() => {
      expect(paymentsMock).toHaveBeenLastCalledWith('tok', storeUser.id, {
        page: 1,
        limit: 10,
        paid: true,
      });
    });
  });

  it('shows recoverable payment error and empty states', async () => {
    paymentsMock.mockRejectedValueOnce(
      new ClientApiError('ADMIN_USER_PAYMENTS_LIST_FAILED', 'falhou'),
    );

    renderDrawer();
    await userEvent.click(screen.getByRole('button', { name: /Pagamento/i }));

    expect(await screen.findByText('falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();

    paymentsMock.mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0 } });
    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByText('Nenhum pagamento encontrado.')).toBeInTheDocument();
  });
});
