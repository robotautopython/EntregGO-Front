export type DeliveryRequestStatus =
  | 'aguardando'
  | 'aceita'
  | 'coletada'
  | 'em_transito'
  | 'entregue'
  | 'expirada'
  | 'cancelada';

export interface CreateDeliveryRequestPayload {
  destinationAddress?: string;
  notes?: string;
}

export interface DeliveryRequest {
  id: string;
  store_id: string;
  destination_address: string | null;
  notes: string | null;
  status: DeliveryRequestStatus;
  courier_id: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  collected_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  updated_at: string;
}
