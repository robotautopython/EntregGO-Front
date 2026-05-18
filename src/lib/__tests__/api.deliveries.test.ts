import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();
const patchMock = vi.fn();

vi.mock('axios', () => {
  const create = vi.fn(() => ({ get: getMock, post: postMock, patch: patchMock }));
  return {
    default: { create, isAxiosError: () => false },
    isAxiosError: () => false,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('listAvailableDeliveries', () => {
  it('sends only page and limit with the Bearer token', async () => {
    const { listAvailableDeliveries } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 1, limit: 20, total: 0 } } },
    });

    await listAvailableDeliveries('tok-123', { page: 2, limit: 20 });

    expect(getMock).toHaveBeenCalledWith('/api/deliveries/available', {
      headers: { Authorization: 'Bearer tok-123' },
      params: { page: 2, limit: 20 },
    });
  });
});

describe('listAdminDeliveries', () => {
  it('sends only page, limit and status with the Bearer token', async () => {
    const { listAdminDeliveries } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 2, limit: 20, total: 0 } } },
    });

    await listAdminDeliveries('tok-123', { page: 2, limit: 20, status: 'entregue' });

    expect(getMock).toHaveBeenCalledWith('/api/admin/deliveries', {
      headers: { Authorization: 'Bearer tok-123' },
      params: { page: 2, limit: 20, status: 'entregue' },
    });
  });
});

describe('getAdminDelivery', () => {
  it('gets one admin delivery with the Bearer token and no params', async () => {
    const { getAdminDelivery } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'entregue' } },
    });

    await getAdminDelivery('tok-123', 'd1');

    expect(getMock).toHaveBeenCalledWith('/api/admin/deliveries/d1', {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('listAdminUserDeliveries', () => {
  it('sends only page, limit and status to the user deliveries endpoint with the Bearer token', async () => {
    const { listAdminUserDeliveries } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 2, limit: 10, total: 0 } } },
    });

    await listAdminUserDeliveries('tok-123', 'u1', { page: 2, limit: 10, status: 'entregue' });

    expect(getMock).toHaveBeenCalledWith('/api/admin/users/u1/deliveries', {
      headers: { Authorization: 'Bearer tok-123' },
      params: { page: 2, limit: 10, status: 'entregue' },
    });
  });
});

describe('listAdminPayments', () => {
  it('sends only M-08 filters with the Bearer token', async () => {
    const { listAdminPayments } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 1, limit: 20, total: 0 } } },
    });

    await listAdminPayments('tok-123', {
      page: 1,
      limit: 20,
      paid: false,
      referenceMonth: '2026-05',
      role: 'logista',
      userStatus: 'ativo',
    });

    expect(getMock).toHaveBeenCalledWith('/api/admin/payments', {
      headers: { Authorization: 'Bearer tok-123' },
      params: {
        page: 1,
        limit: 20,
        paid: 'false',
        referenceMonth: '2026-05',
        role: 'logista',
        userStatus: 'ativo',
      },
    });
  });
});

describe('listAdminUserPayments', () => {
  it('sends only page, limit and paid to the user payments endpoint with the Bearer token', async () => {
    const { listAdminUserPayments } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 2, limit: 10, total: 0 } } },
    });

    await listAdminUserPayments('tok-123', 'u1', { page: 2, limit: 10, paid: false });

    expect(getMock).toHaveBeenCalledWith('/api/admin/users/u1/payments', {
      headers: { Authorization: 'Bearer tok-123' },
      params: { page: 2, limit: 10, paid: 'false' },
    });
  });
});

describe('markAdminPaymentPaid', () => {
  it('patches mark-paid with empty body and the Bearer token', async () => {
    const { markAdminPaymentPaid } = await import('@/lib/api');
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 'p1', paid: true } },
    });

    await markAdminPaymentPaid('tok-123', 'p1');

    expect(patchMock).toHaveBeenCalledWith('/api/admin/payments/p1/mark-paid', undefined, {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('createDeliveryRequest', () => {
  it('posts only the creation payload with the Bearer token', async () => {
    const { createDeliveryRequest } = await import('@/lib/api');
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'aguardando' } },
    });

    await createDeliveryRequest('tok-123', { notes: 'Sem destino informado' });

    expect(postMock).toHaveBeenCalledWith(
      '/api/deliveries',
      { notes: 'Sem destino informado' },
      {
        headers: { Authorization: 'Bearer tok-123' },
      },
    );
  });
});

describe('getMyDelivery', () => {
  it('gets one store delivery with the Bearer token and no params', async () => {
    const { getMyDelivery } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'aceita' } },
    });

    await getMyDelivery('tok-123', 'd1');

    expect(getMock).toHaveBeenCalledWith('/api/deliveries/d1', {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('acceptDelivery', () => {
  it('posts to the accept endpoint with empty body and Bearer token', async () => {
    const { acceptDelivery } = await import('@/lib/api');
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'aceita' } },
    });

    await acceptDelivery('tok-123', 'd1');

    expect(postMock).toHaveBeenCalledWith('/api/deliveries/d1/accept', undefined, {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('getActiveDelivery', () => {
  it('gets the active delivery with the Bearer token and no params', async () => {
    const { getActiveDelivery } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: null },
    });

    await getActiveDelivery('tok-123');

    expect(getMock).toHaveBeenCalledWith('/api/deliveries/active', {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('listCourierHistory', () => {
  it('gets the courier history with page, limit, status and the Bearer token', async () => {
    const { listCourierHistory } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { items: [], pagination: { page: 2, limit: 20, total: 0 } } },
    });

    await listCourierHistory('tok-123', { page: 2, limit: 20, status: 'entregue' });

    expect(getMock).toHaveBeenCalledWith('/api/deliveries/history', {
      headers: { Authorization: 'Bearer tok-123' },
      params: { page: 2, limit: 20, status: 'entregue' },
    });
  });
});

describe('getCourierHistoryDelivery', () => {
  it('gets one courier history delivery with the Bearer token and no params', async () => {
    const { getCourierHistoryDelivery } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'entregue' } },
    });

    await getCourierHistoryDelivery('tok-123', 'd1');

    expect(getMock).toHaveBeenCalledWith('/api/deliveries/history/d1', {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('updateDeliveryStatus', () => {
  it('patches the delivery status with a strict body and Bearer token', async () => {
    const { updateDeliveryStatus } = await import('@/lib/api');
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 'd1', status: 'coletada' } },
    });

    await updateDeliveryStatus('tok-123', 'd1', 'coletada');

    expect(patchMock).toHaveBeenCalledWith(
      '/api/deliveries/d1/status',
      { status: 'coletada' },
      {
        headers: { Authorization: 'Bearer tok-123' },
      },
    );
  });
});

describe('getCourierStatus', () => {
  it('gets the courier operational status with the Bearer token and no params', async () => {
    const { getCourierStatus } = await import('@/lib/api');
    getMock.mockResolvedValue({
      data: { success: true, data: { is_online: false, updated_at: '2026-05-16T12:00:00.000Z' } },
    });

    await getCourierStatus('tok-123');

    expect(getMock).toHaveBeenCalledWith('/api/couriers/me/status', {
      headers: { Authorization: 'Bearer tok-123' },
    });
  });
});

describe('updateCourierStatus', () => {
  it('patches the courier operational status with strict body and Bearer token', async () => {
    const { updateCourierStatus } = await import('@/lib/api');
    patchMock.mockResolvedValue({
      data: { success: true, data: { is_online: true, updated_at: '2026-05-16T12:01:00.000Z' } },
    });

    await updateCourierStatus('tok-123', true);

    expect(patchMock).toHaveBeenCalledWith(
      '/api/couriers/me/status',
      { isOnline: true },
      {
        headers: { Authorization: 'Bearer tok-123' },
      },
    );
  });
});
