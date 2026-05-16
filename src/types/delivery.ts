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

export interface StoreDeliveryListItem {
  id: string;
  destination_address: string | null;
  notes: string | null;
  status: DeliveryRequestStatus;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  collected_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  updated_at: string;
}

export interface StoreDeliveryListResult {
  items: StoreDeliveryListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ListMyDeliveriesQuery {
  page?: number;
  limit?: number;
  status?: DeliveryRequestStatus;
}

export interface AvailableDeliveryStore {
  name: string;
  address: string;
}

export interface AvailableDeliveryItem {
  id: string;
  status: 'aguardando';
  created_at: string;
  expires_at: string;
  store: AvailableDeliveryStore;
}

export interface AvailableDeliveriesQuery {
  page?: number;
  limit?: number;
}

export interface AvailableDeliveriesResult {
  items: AvailableDeliveryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AcceptedDelivery {
  id: string;
  status: DeliveryRequestStatus;
  courier_id: string;
  accepted_at: string;
  created_at: string;
  expires_at: string;
  store: AvailableDeliveryStore;
}

export interface ActiveDelivery {
  id: string;
  destination_address: string | null;
  notes: string | null;
  status: 'aceita';
  accepted_at: string | null;
  created_at: string;
  expires_at: string;
  store: AvailableDeliveryStore;
}
