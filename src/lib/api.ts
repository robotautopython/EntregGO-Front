import axios from 'axios';

import type {
  ApiFailure,
  ApiSuccess,
  AuthContext,
  CourierProfile,
  CourierRegistrationPayload,
  RegistrationResult,
  StoreProfile,
  StoreRegistrationPayload,
} from '@/types/auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ClientApiError extends Error {
  public readonly code: string;
  public readonly details: unknown[];

  public constructor(code: string, message: string, details: unknown[] = []) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

function assertApiUrlConfigured() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new ClientApiError('API_URL_MISSING', 'API publica nao configurada');
  }
}

function unwrapResponse<T>(response: ApiSuccess<T> | ApiFailure): T {
  if (response.success) {
    return response.data;
  }

  throw new ClientApiError(response.error.code, response.error.message, response.error.details);
}

function mapAxiosError(error: unknown): never {
  if (axios.isAxiosError<ApiFailure>(error) && error.response?.data?.success === false) {
    const apiError = error.response.data.error;
    throw new ClientApiError(apiError.code, apiError.message, apiError.details);
  }

  throw new ClientApiError('REQUEST_FAILED', 'Nao foi possivel concluir a requisicao');
}

export async function registerStore(payload: StoreRegistrationPayload) {
  try {
    assertApiUrlConfigured();
    const response = await api.post<ApiSuccess<RegistrationResult<StoreProfile>> | ApiFailure>(
      '/api/auth/register/store',
      payload,
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function registerCourier(payload: CourierRegistrationPayload) {
  try {
    assertApiUrlConfigured();
    const response = await api.post<ApiSuccess<RegistrationResult<CourierProfile>> | ApiFailure>(
      '/api/auth/register/courier',
      payload,
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getMe(accessToken: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AuthContext> | ApiFailure>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}
