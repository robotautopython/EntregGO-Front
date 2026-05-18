import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DeliveryRequest } from '@/types/delivery';

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ClientApiError: actual.ClientApiError,
    createDeliveryRequest: vi.fn(),
  };
});

import { createDeliveryRequest } from '@/lib/api';

import { NovaEntregaFlow } from '../NovaEntregaFlow';

const createMock = vi.mocked(createDeliveryRequest);

const createdDelivery: DeliveryRequest = {
  id: '99999999-9999-4999-8999-999999999999',
  destination_address: null,
  notes: null,
  status: 'aguardando',
  created_at: '2026-05-17T12:00:00.000Z',
  expires_at: '2026-05-17T12:10:00.000Z',
  accepted_at: null,
  collected_at: null,
  in_transit_at: null,
  delivered_at: null,
  updated_at: '2026-05-17T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('NovaEntregaFlow', () => {
  it('offers a clear CTA to the created delivery detail', async () => {
    createMock.mockResolvedValue(createdDelivery);

    const { container } = render(<NovaEntregaFlow accessToken="tok" />);

    await userEvent.click(screen.getByRole('button', { name: /Criar solicitação/i }));

    const detailLink = await screen.findByRole('link', { name: /Acompanhar entrega/i });
    expect(detailLink).toHaveAttribute('href', `/loja/entregas/${createdDelivery.id}`);
    expect(createMock).toHaveBeenCalledWith('tok', {});
    expect(container.innerHTML).not.toMatch(/store_id|courier_id|Authorization|Bearer/i);
  });

  it('explains that store name and pickup address come from the store profile', () => {
    render(<NovaEntregaFlow accessToken="tok" />);

    expect(screen.getByText('Sobre a loja e a coleta')).toBeInTheDocument();
    expect(
      screen.getByText(/Nome da loja e endereco de coleta vem do perfil cadastrado/i),
    ).toBeInTheDocument();
  });
});
