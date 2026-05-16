import { describe, expect, it } from 'vitest';

import { ClientApiError } from '@/lib/api';

import { mapCourierError } from '../FilaDisponivel';

describe('mapCourierError', () => {
  it('maps non-ClientApiError to a generic recoverable message', () => {
    const result = mapCourierError(new Error('boom'));
    expect(result.title).toBe('Não foi possível concluir');
    expect(result.message).toMatch(/Tente novamente/);
  });

  it.each([
    ['ALREADY_ACCEPTED', 'Entrega já aceita'],
    ['DELIVERY_EXPIRED', 'Entrega expirou'],
    ['DELIVERY_NOT_FOUND', 'Entrega indisponível'],
    ['COURIER_OFFLINE', 'Você está offline'],
    ['COURIER_STATUS_UPDATE_FAILED', 'Status não atualizado'],
    ['COURIER_PROFILE_REQUIRED', 'Perfil de motoboy necessário'],
    ['USER_PENDING', 'Cadastro aguardando aprovação'],
    ['USER_BLOCKED', 'Conta bloqueada'],
    ['FORBIDDEN_ROLE', 'Permissão negada'],
    ['AUTH_REQUIRED', 'Sessão inválida'],
    ['INVALID_TOKEN', 'Sessão inválida'],
    ['DOMAIN_USER_NOT_FOUND', 'Sessão inválida'],
  ])('maps %s to its dedicated title', (code, title) => {
    const result = mapCourierError(new ClientApiError(code, 'srv'));
    expect(result.title).toBe(title);
  });

  it('keeps the server message for API_URL_MISSING', () => {
    const result = mapCourierError(new ClientApiError('API_URL_MISSING', 'API publica nao configurada'));
    expect(result.title).toBe('API não configurada');
    expect(result.message).toBe('API publica nao configurada');
  });

  it('falls back to the server message for unknown codes', () => {
    const result = mapCourierError(new ClientApiError('WHATEVER', 'mensagem do servidor'));
    expect(result.message).toBe('mensagem do servidor');
  });
});
