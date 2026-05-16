import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock('axios', () => {
  const create = vi.fn(() => ({ get: getMock, post: postMock }));
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
