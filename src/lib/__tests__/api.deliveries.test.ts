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
