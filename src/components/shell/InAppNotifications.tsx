'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface InAppNotificationItem {
  id: string;
  message: string;
  createdAt: string;
}

interface InAppNotificationsContextValue {
  items: InAppNotificationItem[];
  unreadCount: number;
  notify: (message: string) => void;
  clear: () => void;
}

const NOTIFICATION_LIMIT = 6;
const GENERIC_MESSAGES = new Set([
  'Ha novas solicitacoes na fila.',
  'A entrega foi atualizada.',
]);

const noopContext: InAppNotificationsContextValue = {
  items: [],
  unreadCount: 0,
  notify: () => undefined,
  clear: () => undefined,
};

const InAppNotificationsContext = createContext<InAppNotificationsContextValue | null>(null);

let notificationSequence = 0;

function sanitizeMessage(message: string): string {
  return GENERIC_MESSAGES.has(message) ? message : 'Atualizacao recebida.';
}

export function InAppNotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InAppNotificationItem[]>([]);

  const notify = useCallback((message: string) => {
    const safeMessage = sanitizeMessage(message);
    const id = `${Date.now()}-${notificationSequence++}`;
    const createdAt = new Date().toISOString();

    setItems((current) => [
      { id, message: safeMessage, createdAt },
      ...current.slice(0, NOTIFICATION_LIMIT - 1),
    ]);
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<InAppNotificationsContextValue>(
    () => ({
      items,
      unreadCount: items.length,
      notify,
      clear,
    }),
    [clear, items, notify],
  );

  return (
    <InAppNotificationsContext.Provider value={value}>
      {children}
    </InAppNotificationsContext.Provider>
  );
}

export function useInAppNotifications(): InAppNotificationsContextValue {
  return useContext(InAppNotificationsContext) ?? noopContext;
}
