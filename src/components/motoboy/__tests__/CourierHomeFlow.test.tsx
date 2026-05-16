import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthContext } from '@/types/auth';

const navigationMock = vi.hoisted(() => ({
  params: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => navigationMock.params,
}));

import { CourierHomeFlow } from '../CourierHomeFlow';

const authContext: AuthContext = {
  authUserId: 'auth-courier',
  user: {
    id: 'courier-domain',
    auth_id: 'auth-courier',
    email: 'courier@example.test',
    role: 'motoboy',
    status: 'ativo',
    approved_at: '2026-05-16T12:00:00.000Z',
    approved_by: null,
    created_at: '2026-05-16T12:00:00.000Z',
    updated_at: '2026-05-16T12:00:00.000Z',
  },
};

beforeEach(() => {
  navigationMock.params = new URLSearchParams();
});

afterEach(() => {
  cleanup();
});

describe('CourierHomeFlow', () => {
  it('keeps demo=ativo isolated from the real motoboy flow', async () => {
    navigationMock.params = new URLSearchParams('demo=ativo');

    render(<CourierHomeFlow authContext={authContext} accessToken="tok" />);

    expect(await screen.findByText('Corrida demo em andamento')).toBeInTheDocument();
  });
});
