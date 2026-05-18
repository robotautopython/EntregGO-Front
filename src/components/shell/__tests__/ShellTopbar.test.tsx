import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AuthContext } from '@/types/auth';

import { ShellTopbar } from '../ShellTopbar';

const authContext: AuthContext = {
  authUserId: 'auth-1',
  user: {
    id: 'user-1',
    auth_id: 'auth-1',
    email: 'store@example.test',
    role: 'logista',
    status: 'ativo',
    approved_at: null,
    approved_by: null,
    created_at: '2026-05-18T12:00:00.000Z',
    updated_at: '2026-05-18T12:00:00.000Z',
  },
};

afterEach(() => {
  cleanup();
});

describe('ShellTopbar notifications', () => {
  it('shows generic in-app notifications in the bell menu without sensitive payload', async () => {
    const onClear = vi.fn();
    const { container } = render(
      <ShellTopbar
        role="logista"
        authContext={authContext}
        title="Entrega"
        notifications={1}
        notificationItems={[
          {
            id: 'n1',
            message: 'A entrega foi atualizada.',
            createdAt: '2026-05-18T12:30:00.000Z',
          },
        ]}
        onClearNotifications={onClear}
        onOpenMobileNav={vi.fn()}
        onSignOut={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Notificacoes (1)' }));

    const menu = screen.getByRole('menu', { name: 'Notificacoes in-app' });
    expect(within(menu).getByText('A entrega foi atualizada.')).toBeInTheDocument();
    expect(menu.innerHTML).not.toMatch(
      /deliveryId|status|address|destination_address|notes|store_id|courier_id|user_id|auth_id|Authorization|Bearer|service_role|token|email|phone/i,
    );
    expect(container.innerHTML).not.toMatch(/deliveryId|Authorization|Bearer|service_role|token/i);

    await userEvent.click(within(menu).getByRole('button', { name: 'Limpar notificacoes' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('keeps the bell actionable when there are no notifications', async () => {
    render(
      <ShellTopbar
        role="motoboy"
        authContext={authContext}
        title="Corridas"
        onOpenMobileNav={vi.fn()}
        onSignOut={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Notificacoes' }));

    expect(screen.getByRole('menu', { name: 'Notificacoes in-app' })).toHaveTextContent(
      'Nenhuma notificacao nova.',
    );
  });
});
