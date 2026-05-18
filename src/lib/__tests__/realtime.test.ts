import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => {
  const on = vi.fn(() => channel);
  const subscribe = vi.fn(() => channel);
  const channel = { on, subscribe };
  return {
    channel,
    on,
    subscribe,
    channelFactory: vi.fn(() => channel),
    removeChannel: vi.fn(),
    setAuth: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/lib/supabase', () => ({
  createBrowserSupabaseClient: () => ({
    realtime: { setAuth: supabaseMock.setAuth },
    channel: supabaseMock.channelFactory,
    removeChannel: supabaseMock.removeChannel,
  }),
}));

import {
  DELIVERY_ACCEPTED_EVENT,
  DELIVERY_AVAILABLE_TOPIC,
  DELIVERY_CREATED_EVENT,
  DELIVERY_STATUS_CHANGED_EVENT,
  isDeliveryRealtimePayload,
  subscribeToAvailableDeliveriesBroadcast,
  subscribeToStoreDeliveryBroadcast,
} from '@/lib/realtime';

beforeEach(() => {
  vi.clearAllMocks();
  supabaseMock.setAuth.mockResolvedValue(undefined);
  supabaseMock.on.mockReturnValue(supabaseMock.channel);
  supabaseMock.subscribe.mockReturnValue(supabaseMock.channel);
  supabaseMock.channelFactory.mockReturnValue(supabaseMock.channel);
});

describe('realtime helpers', () => {
  it('subscribes to delivery:available as a private channel after setting auth', async () => {
    subscribeToAvailableDeliveriesBroadcast('tok', vi.fn());
    await vi.waitFor(() => expect(supabaseMock.setAuth).toHaveBeenCalledWith('tok'));

    expect(supabaseMock.channelFactory).toHaveBeenCalledWith(DELIVERY_AVAILABLE_TOPIC, {
      config: { private: true },
    });
    expect(supabaseMock.on).toHaveBeenCalledWith(
      'broadcast',
      { event: DELIVERY_CREATED_EVENT },
      expect.any(Function),
    );
    expect(supabaseMock.subscribe).toHaveBeenCalled();
  });

  it('subscribes to store delivery detail events and filters payloads by delivery id', async () => {
    const onChanged = vi.fn();
    subscribeToStoreDeliveryBroadcast('tok', 'd1', onChanged);
    await vi.waitFor(() => expect(supabaseMock.channelFactory).toHaveBeenCalled());

    expect(supabaseMock.channelFactory).toHaveBeenCalledWith('delivery:d1', {
      config: { private: true },
    });
    expect(supabaseMock.on).toHaveBeenCalledWith(
      'broadcast',
      { event: DELIVERY_ACCEPTED_EVENT },
      expect.any(Function),
    );
    expect(supabaseMock.on).toHaveBeenCalledWith(
      'broadcast',
      { event: DELIVERY_STATUS_CHANGED_EVENT },
      expect.any(Function),
    );

    const onCalls = supabaseMock.on.mock.calls as unknown as [
      string,
      Record<string, unknown>,
      (message: { payload: unknown }) => void,
    ][];
    const acceptedHandler = onCalls[0][2];
    acceptedHandler({
      payload: {
        deliveryId: 'other',
        status: 'aceita',
        updatedAt: '2026-05-18T12:00:00.000Z',
      },
    });
    acceptedHandler({
      payload: {
        deliveryId: 'd1',
        status: 'aceita',
        updatedAt: '2026-05-18T12:00:00.000Z',
      },
    });

    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it('removes channels on unsubscribe', async () => {
    const unsubscribe = subscribeToAvailableDeliveriesBroadcast('tok', vi.fn());
    await vi.waitFor(() => expect(supabaseMock.channelFactory).toHaveBeenCalled());

    unsubscribe();

    expect(supabaseMock.removeChannel).toHaveBeenCalledWith(supabaseMock.channel);
  });

  it('validates realtime payloads by whitelist', () => {
    expect(
      isDeliveryRealtimePayload({
        deliveryId: 'd1',
        status: 'em_transito',
        updatedAt: '2026-05-18T12:00:00.000Z',
      }),
    ).toBe(true);
    expect(
      isDeliveryRealtimePayload({
        deliveryId: 'd1',
        status: 'em_transito',
        updatedAt: '2026-05-18T12:00:00.000Z',
        destination_address: 'nao usar',
      }),
    ).toBe(false);
    expect(isDeliveryRealtimePayload({ deliveryId: 'd1', status: 'cancelada' })).toBe(false);
    expect(isDeliveryRealtimePayload({ deliveryId: 'd1', status: 'aceita' })).toBe(false);
  });
});
