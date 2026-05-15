export type DeliveryFlowState = 'idle' | 'searching' | 'accepted' | 'expired';

export type DeliveryStatus =
  | 'aceito'
  | 'coletou'
  | 'em_transito'
  | 'entregue'
  | 'expirada'
  | 'cancelada';

export interface DeliveryDraft {
  destinationAddress: string;
  destinationDetails?: string;
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

export interface HistoryEntry {
  id: string;
  createdAt: string;
  status: DeliveryStatus;
  destination: string;
  notes?: string;
  courier?: string;
}

export const statusLabel: Record<DeliveryStatus, string> = {
  aceito: 'Aceito',
  coletou: 'Coletou',
  em_transito: 'Em trânsito',
  entregue: 'Entregue',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
};

export const statusTone: Record<DeliveryStatus, 'success' | 'warn' | 'route' | 'brand' | 'danger' | 'paper'> = {
  aceito: 'route',
  coletou: 'brand',
  em_transito: 'brand',
  entregue: 'success',
  expirada: 'danger',
  cancelada: 'paper',
};

export const sampleHistory: HistoryEntry[] = [
  {
    id: 'd-001',
    createdAt: '2026-05-14T16:42:00',
    status: 'entregue',
    destination: 'Av. Brasil, 884 — Apto 51, Centro',
    courier: 'João Marques',
  },
  {
    id: 'd-002',
    createdAt: '2026-05-14T15:10:00',
    status: 'entregue',
    destination: 'Rua das Flores, 120, Vila Nova',
    courier: 'Carla Souza',
    notes: 'Entregar na portaria',
  },
  {
    id: 'd-003',
    createdAt: '2026-05-14T11:58:00',
    status: 'expirada',
    destination: 'Av. Independência, 4500, Jardim Europa',
  },
  {
    id: 'd-004',
    createdAt: '2026-05-13T19:31:00',
    status: 'entregue',
    destination: 'Travessa do Sol, 87, Boa Vista',
    courier: 'Lucas Andrade',
  },
  {
    id: 'd-005',
    createdAt: '2026-05-13T18:05:00',
    status: 'entregue',
    destination: 'Praça Central, 12, Centro',
    courier: 'Maria Gomes',
  },
  {
    id: 'd-006',
    createdAt: '2026-05-13T14:20:00',
    status: 'cancelada',
    destination: 'Av. das Palmeiras, 200',
    notes: 'Cliente pediu cancelamento',
  },
  {
    id: 'd-007',
    createdAt: '2026-05-12T20:45:00',
    status: 'entregue',
    destination: 'Rua Itacolomi, 99, Cidade Alta',
    courier: 'João Marques',
  },
  {
    id: 'd-008',
    createdAt: '2026-05-12T17:12:00',
    status: 'entregue',
    destination: 'Av. Costa, 1200, Beira-Mar',
    courier: 'Carla Souza',
  },
];

export function groupHistoryByDay(entries: HistoryEntry[]): Array<{ day: string; items: HistoryEntry[] }> {
  const byDay = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const day = entry.createdAt.slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(entry);
    byDay.set(day, list);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, items]) => ({ day, items }));
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (day === todayStr) return 'Hoje';
  if (day === yesterday) return 'Ontem';
  return dayFormatter.format(date);
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}
