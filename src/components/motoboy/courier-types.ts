export type RideStatus = 'aceito' | 'coletou' | 'em_transito' | 'entregue';
export type RideOutcome = 'entregue' | 'recusada' | 'expirada';

export interface IncomingRequest {
  id: string;
  arrivedAt: number;
  store: {
    name: string;
    initials: string;
    address: string;
    distanceLabel: string;
  };
  destination: string;
  notes?: string;
}

export interface ActiveRide {
  id: string;
  status: RideStatus;
  acceptedAt: number;
  store: IncomingRequest['store'];
  destination: string;
  notes?: string;
}

export interface CourierHistoryEntry {
  id: string;
  finishedAt: string;
  outcome: RideOutcome;
  store: string;
  destination: string;
}

export const rideStatusLabel: Record<RideStatus, string> = {
  aceito: 'Aceito',
  coletou: 'Coletou',
  em_transito: 'Em trânsito',
  entregue: 'Entregue',
};

export const rideStatusOrder: RideStatus[] = ['aceito', 'coletou', 'em_transito', 'entregue'];

export const sampleStores: Array<Omit<IncomingRequest, 'id' | 'arrivedAt'>> = [
  {
    store: {
      name: 'Açaí da Esquina',
      initials: 'AE',
      address: 'Rua das Flores, 120 — Centro',
      distanceLabel: '2.5 km',
    },
    destination: 'Av. Brasil, 884 — Apto 51',
    notes: 'Entregar na portaria, gelado.',
  },
  {
    store: {
      name: 'Pizzaria Bella',
      initials: 'PB',
      address: 'Av. Independência, 88 — Jardim',
      distanceLabel: '1.2 km',
    },
    destination: 'Rua Pedro Álvares, 412',
  },
  {
    store: {
      name: 'Mercadinho do Zé',
      initials: 'MZ',
      address: 'Rua Cláudia, 27 — Vila Nova',
      distanceLabel: '3.1 km',
    },
    destination: 'Travessa do Sol, 87, Boa Vista',
    notes: 'Sacolas pesadas — vir devagar.',
  },
];

export const sampleCourierHistory: CourierHistoryEntry[] = [
  {
    id: 'r-001',
    finishedAt: '2026-05-14T17:25:00',
    outcome: 'entregue',
    store: 'Açaí da Esquina',
    destination: 'Av. Brasil, 884 — Apto 51',
  },
  {
    id: 'r-002',
    finishedAt: '2026-05-14T15:50:00',
    outcome: 'entregue',
    store: 'Pizzaria Bella',
    destination: 'Rua Pedro Álvares, 412',
  },
  {
    id: 'r-003',
    finishedAt: '2026-05-14T13:12:00',
    outcome: 'recusada',
    store: 'Loja Acme',
    destination: 'Av. das Palmeiras, 200',
  },
  {
    id: 'r-004',
    finishedAt: '2026-05-13T20:40:00',
    outcome: 'entregue',
    store: 'Mercadinho do Zé',
    destination: 'Travessa do Sol, 87',
  },
  {
    id: 'r-005',
    finishedAt: '2026-05-13T18:15:00',
    outcome: 'expirada',
    store: 'Hamburgueria Top',
    destination: 'Rua das Acácias, 55',
  },
  {
    id: 'r-006',
    finishedAt: '2026-05-12T21:00:00',
    outcome: 'entregue',
    store: 'Pizzaria Bella',
    destination: 'Av. Costa, 1200',
  },
];

export const outcomeTone: Record<
  RideOutcome,
  { label: string; tone: 'success' | 'danger' | 'paper' }
> = {
  entregue: { label: 'Entregue', tone: 'success' },
  recusada: { label: 'Recusada', tone: 'paper' },
  expirada: { label: 'Expirada', tone: 'danger' },
};

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCourierDayLabel(day: string): string {
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

export function formatCourierTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function groupCourierHistory(
  entries: CourierHistoryEntry[],
): Array<{ day: string; items: CourierHistoryEntry[] }> {
  const byDay = new Map<string, CourierHistoryEntry[]>();
  for (const entry of entries) {
    const day = entry.finishedAt.slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(entry);
    byDay.set(day, list);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, items]) => ({ day, items }));
}

export function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
