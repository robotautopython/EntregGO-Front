import type { RealtimeChannel } from '@supabase/supabase-js';

import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { DeliveryRequestStatus } from '@/types/delivery';

export const DELIVERY_CREATED_EVENT = 'delivery.created';
export const DELIVERY_ACCEPTED_EVENT = 'delivery.accepted';
export const DELIVERY_STATUS_CHANGED_EVENT = 'delivery.status_changed';
export const DELIVERY_AVAILABLE_TOPIC = 'delivery:available';

export type DeliveryRealtimeEvent =
  | typeof DELIVERY_CREATED_EVENT
  | typeof DELIVERY_ACCEPTED_EVENT
  | typeof DELIVERY_STATUS_CHANGED_EVENT;

export interface DeliveryRealtimePayload {
  deliveryId: string;
  status: Extract<
    DeliveryRequestStatus,
    'aguardando' | 'aceita' | 'coletada' | 'em_transito' | 'entregue'
  >;
  updatedAt: string;
}

interface SubscribeOptions {
  accessToken: string;
  topic: string;
  events: DeliveryRealtimeEvent[];
  onEvent: (event: DeliveryRealtimeEvent, payload: DeliveryRealtimePayload) => void;
  onError?: () => void;
}

const payloadStatuses = new Set([
  'aguardando',
  'aceita',
  'coletada',
  'em_transito',
  'entregue',
]);

const forbiddenPayloadKeys = new Set([
  'address',
  'auth_id',
  'authorization',
  'courier_id',
  'destination_address',
  'email',
  'header',
  'name',
  'notes',
  'phone',
  'service_role',
  'store_id',
  'token',
  'user_id',
]);

export function isDeliveryRealtimePayload(value: unknown): value is DeliveryRealtimePayload {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  if (Object.keys(candidate).some((key) => forbiddenPayloadKeys.has(key.toLowerCase()))) {
    return false;
  }

  return (
    typeof candidate.deliveryId === 'string' &&
    typeof candidate.status === 'string' &&
    payloadStatuses.has(candidate.status) &&
    typeof candidate.updatedAt === 'string'
  );
}

export function subscribeToPrivateDeliveryBroadcast({
  accessToken,
  topic,
  events,
  onEvent,
  onError,
}: SubscribeOptions): () => void {
  if (!accessToken) return () => undefined;

  const supabase = createBrowserSupabaseClient();
  let channel: RealtimeChannel | null = null;
  let isClosed = false;

  void supabase.realtime
    .setAuth(accessToken)
    .then(() => {
      if (isClosed) return;

      channel = supabase.channel(topic, { config: { private: true } });
      events.forEach((event) => {
        channel?.on('broadcast', { event }, (message) => {
          if (isDeliveryRealtimePayload(message.payload)) {
            onEvent(event, message.payload);
          }
        });
      });
      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          onError?.();
        }
      });
    })
    .catch(() => {
      onError?.();
    });

  return () => {
    isClosed = true;
    if (channel) {
      void supabase.removeChannel(channel);
    }
  };
}

export function subscribeToAvailableDeliveriesBroadcast(
  accessToken: string,
  onDeliveryCreated: () => void,
  onError?: () => void,
) {
  return subscribeToPrivateDeliveryBroadcast({
    accessToken,
    topic: DELIVERY_AVAILABLE_TOPIC,
    events: [DELIVERY_CREATED_EVENT],
    onEvent: () => onDeliveryCreated(),
    onError,
  });
}

export function subscribeToStoreDeliveryBroadcast(
  accessToken: string,
  deliveryId: string,
  onDeliveryChanged: () => void,
  onError?: () => void,
) {
  return subscribeToPrivateDeliveryBroadcast({
    accessToken,
    topic: `delivery:${deliveryId}`,
    events: [DELIVERY_ACCEPTED_EVENT, DELIVERY_STATUS_CHANGED_EVENT],
    onEvent: (_event, payload) => {
      if (payload.deliveryId === deliveryId) {
        onDeliveryChanged();
      }
    },
    onError,
  });
}
