import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminPaymentsResult } from '@/types/payment';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    listAdminPayments: vi.fn(),
    markAdminPaymentPaid: vi.fn(),
  };
});

import { ClientApiError, listAdminPayments, markAdminPaymentPaid } from '@/lib/api';

import { AdminPaymentsPanel } from '../AdminPaymentsPanel';

const listMock = vi.mocked(listAdminPayments);
const markMock = vi.mocked(markAdminPaymentPaid);

const result: AdminPaymentsResult = {
  items: [
    {
      id: '99999999-9999-4999-8999-999999999999',
      reference_month: '2026-05',
      due_date: '2026-05-31',
      paid: false,
      paid_at: null,
      created_at: '2026-05-17T12:00:00.000Z',
      updated_at: '2026-05-17T12:00:00.000Z',
      user: {
        role: 'logista',
        status: 'ativo',
        store_name: 'Loja Teste',
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

describe('AdminPaymentsPanel', () => {
  it('renders the real admin payment list without forbidden fields', async () => {
    listMock.mockResolvedValue(result);

    const { container } = render(<AdminPaymentsPanel accessToken="tok" />);

    expect(await screen.findByText('Loja Teste')).toBeInTheDocument();
    expect(screen.getByText('05/2026')).toBeInTheDocument();
    expect(screen.getByText('31/05/2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marcar pago/i })).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledWith('tok', { page: 1, limit: 20, paid: false });

    expect(container.innerHTML).not.toMatch(
      /user_id|auth_id|owner_name|full_name|marked_by|approved_by|amount|paymentMethod|payment_method|receipt|bankData|Authorization|Bearer|token|email/i,
    );
  });

  it('requests filters allowed by the backend and resets to the first page', async () => {
    listMock.mockResolvedValue({ items: [], pagination: { page: 1, limit: 20, total: 0 } });

    render(<AdminPaymentsPanel accessToken="tok" />);

    await screen.findByText('Nenhum controle encontrado.');
    await userEvent.click(screen.getByRole('button', { name: 'Pagos' }));
    await userEvent.type(screen.getByLabelText(/Mes de referencia/i), '2026-05');
    await userEvent.selectOptions(screen.getByLabelText(/Perfil/i), 'logista');
    await userEvent.selectOptions(screen.getByLabelText(/Status do usuario/i), 'ativo');

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', {
        page: 1,
        limit: 20,
        paid: true,
        referenceMonth: '2026-05',
        role: 'logista',
        userStatus: 'ativo',
      });
    });
  });

  it('shows a recoverable list error state', async () => {
    listMock.mockRejectedValue(
      new ClientApiError('ADMIN_PAYMENTS_LIST_FAILED', 'Listagem de pagamentos falhou'),
    );

    render(<AdminPaymentsPanel accessToken="tok" />);

    expect(await screen.findByText('Listagem de pagamentos falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
  });

  it('uses pagination controls without unsupported query fields', async () => {
    listMock
      .mockResolvedValueOnce({
        ...result,
        pagination: { page: 1, limit: 20, total: 21 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { page: 2, limit: 20, total: 21 },
      });

    render(<AdminPaymentsPanel accessToken="tok" />);

    await screen.findByText('Loja Teste');
    await userEvent.click(screen.getByRole('button', { name: /Proxima/i }));

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', { page: 2, limit: 20, paid: false });
    });
  });

  it('blocks duplicate mark-paid clicks while the request is pending', async () => {
    let resolveMark!: () => void;
    const pendingMark = new Promise<void>((resolve) => {
      resolveMark = resolve;
    });

    listMock
      .mockResolvedValueOnce(result)
      .mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 20, total: 0 } });
    markMock.mockImplementation(async () => {
      await pendingMark;
      return { ...result.items[0], paid: true, paid_at: '2026-05-17T12:10:00.000Z' };
    });

    render(<AdminPaymentsPanel accessToken="tok" />);

    const button = await screen.findByRole('button', { name: /Marcar pago/i });
    await userEvent.dblClick(button);

    expect(markMock).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    resolveMark();

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith('tok', { page: 1, limit: 20, paid: false });
    });
  });

  it('shows a retry-safe action error when mark-paid fails', async () => {
    listMock.mockResolvedValue(result);
    markMock.mockRejectedValue(
      new ClientApiError('ADMIN_PAYMENT_MARK_PAID_FAILED', 'Marcacao de pagamento falhou'),
    );

    render(<AdminPaymentsPanel accessToken="tok" />);

    await userEvent.click(await screen.findByRole('button', { name: /Marcar pago/i }));

    expect(await screen.findByText('Marcacao de pagamento falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Marcar pago/i })).toBeEnabled();
  });
});
