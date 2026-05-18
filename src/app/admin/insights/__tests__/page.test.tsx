import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminInsights } from '@/types/auth';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    getAdminInsights: vi.fn(),
  };
});

vi.mock('@/components/shell/OperationalShell', () => ({
  OperationalShell: ({ children }: { children: (context: { accessToken: string }) => ReactNode }) => (
    <>{children({ accessToken: 'tok' })}</>
  ),
}));

import { ClientApiError, getAdminInsights } from '@/lib/api';

import AdminInsightsPage from '../page';

const getMock = vi.mocked(getAdminInsights);

const emptyInsights: AdminInsights = {
  generated_at: '2026-05-18T12:00:00.000Z',
  user_counts: {
    admin: { pendente: 0, ativo: 0, bloqueado: 0 },
    logista: { pendente: 0, ativo: 0, bloqueado: 0 },
    motoboy: { pendente: 0, ativo: 0, bloqueado: 0 },
  },
  active_accounts: {
    stores: 0,
    couriers: 0,
  },
  delivery_counts_by_status: {
    aguardando: 0,
    aceita: 0,
    coletada: 0,
    em_transito: 0,
    entregue: 0,
    expirada: 0,
    cancelada: 0,
  },
  payment_counts: {
    paid: 0,
    pending: 0,
  },
  latest_pending_users: {
    limit: 5,
    items: [],
  },
};

const filledInsights: AdminInsights = {
  ...emptyInsights,
  user_counts: {
    admin: { pendente: 0, ativo: 1, bloqueado: 0 },
    logista: { pendente: 2, ativo: 10, bloqueado: 1 },
    motoboy: { pendente: 3, ativo: 8, bloqueado: 0 },
  },
  active_accounts: {
    stores: 10,
    couriers: 8,
  },
  delivery_counts_by_status: {
    aguardando: 4,
    aceita: 3,
    coletada: 2,
    em_transito: 1,
    entregue: 9,
    expirada: 5,
    cancelada: 6,
  },
  payment_counts: {
    paid: 7,
    pending: 11,
  },
  latest_pending_users: {
    limit: 5,
    items: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: 'logista',
        status: 'pendente',
        created_at: '2026-05-18T11:00:00.000Z',
      },
    ],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminInsightsPanel', () => {
  it('shows a loading state while insights are pending', () => {
    getMock.mockReturnValue(new Promise(() => undefined));

    render(<AdminInsightsPage />);

    expect(screen.getByText('Insights da central')).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('shows a recoverable error state and retries', async () => {
    getMock
      .mockRejectedValueOnce(new ClientApiError('ADMIN_INSIGHTS_FAILED', 'Falha controlada'))
      .mockResolvedValueOnce(emptyInsights);

    render(<AdminInsightsPage />);

    expect(await screen.findByText('Falha ao carregar')).toBeInTheDocument();
    expect(screen.getByText('Falha controlada')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    await screen.findByText('Sem dados ainda');
    expect(getMock).toHaveBeenCalledTimes(2);
  });

  it('shows an honest empty state when every aggregate is zero', async () => {
    getMock.mockResolvedValue(emptyInsights);

    render(<AdminInsightsPage />);

    expect(await screen.findByText('Sem dados ainda')).toBeInTheDocument();
    expect(
      screen.getByText('A API respondeu, mas ainda não há usuários, entregas ou pagamentos para resumir.'),
    ).toBeInTheDocument();
  });

  it('renders delivery and payment aggregates without forbidden fields', async () => {
    getMock.mockResolvedValue(filledInsights);

    const { container } = render(<AdminInsightsPage />);

    expect(await screen.findByText('Entregas por status')).toBeInTheDocument();
    expect(screen.getByText('Aguardando')).toBeInTheDocument();
    expect(screen.getByText('Entregue')).toBeInTheDocument();
    expect(screen.getByText('Pagamentos externos')).toBeInTheDocument();
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText('11').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('tok');
    });
    expect(container.textContent).not.toMatch(
      /store_id|courier_id|user_id|auth_id|email|owner_name|full_name|marked_by|reference_month|due_date|paid_at|amount|paymentMethod|payment_method|pix|card|boleto|receipt|Authorization|Bearer|token/i,
    );
  });
});
