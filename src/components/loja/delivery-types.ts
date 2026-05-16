export type DeliveryFlowState = 'idle' | 'searching' | 'accepted' | 'expired';

export type DeliveryStatus =
  | 'aceito'
  | 'coletou'
  | 'em_transito'
  | 'entregue'
  | 'expirada'
  | 'cancelada';

export interface DeliveryDraft {
  destinationAddress?: string;
  notes?: string;
}

export interface AcceptedDelivery {
  id: string;
  status: Exclude<DeliveryStatus, 'expirada' | 'cancelada'>;
  acceptedAt: string;
  courier: {
    name: string;
    initials: string;
    bikePlate?: string;
    distanceLabel?: string;
  };
  route: {
    from: string;
    to: string;
    notes?: string;
  };
}

// O histórico real da loja vive em HistoricoEntregas.tsx consumindo
// GET /api/deliveries (contrato backend, status DeliveryRequestStatus).
// O mock sampleHistory e o enum divergente de status foram removidos no M-05.
