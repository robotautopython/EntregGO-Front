import axios from 'axios';

import type {
  AdminInsights,
  AdminUserDetail,
  AdminUsersQuery,
  AdminUsersResult,
  ApiFailure,
  ApiSuccess,
  AuthContext,
  CourierProfile,
  CourierOperationalStatus,
  CourierRegistrationPayload,
  RegistrationResult,
  StoreProfile,
  StoreRegistrationPayload,
} from '@/types/auth';
import type {
  AcceptedDelivery,
  ActiveDelivery,
  AdminDeliveryDetail,
  AdminDeliveriesQuery,
  AdminDeliveriesResult,
  AdminUserDeliveriesQuery,
  AdminUserDeliveriesResult,
  AvailableDeliveriesQuery,
  AvailableDeliveriesResult,
  CreateDeliveryRequestPayload,
  CourierDeliveryHistoryDetail,
  CourierDeliveryHistoryResult,
  DeliveryStatusUpdateResult,
  DeliveryTransitionStatus,
  DeliveryRequest,
  ListCourierHistoryQuery,
  ListMyDeliveriesQuery,
  StoreDeliveryDetail,
  StoreDeliveryListResult,
} from '@/types/delivery';
import type {
  AdminPaymentListItem,
  AdminPaymentsQuery,
  AdminPaymentsResult,
  AdminUserPaymentsQuery,
  AdminUserPaymentsResult,
} from '@/types/payment';

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
  if (error instanceof ClientApiError) {
    throw error;
  }

  if (axios.isAxiosError<ApiFailure>(error) && error.response?.data?.success === false) {
    const apiError = error.response.data.error;
    throw new ClientApiError(apiError.code, apiError.message, apiError.details);
  }

  throw new ClientApiError('REQUEST_FAILED', 'Não foi possível concluir a requisição');
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

function bearerHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function listAdminUsers(accessToken: string, query: AdminUsersQuery) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminUsersResult> | ApiFailure>('/api/admin/users', {
      headers: bearerHeaders(accessToken),
      params: {
        page: query.page,
        limit: query.limit,
        role: query.role || undefined,
        status: query.status || undefined,
        search: query.search || undefined,
      },
    });

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getAdminUserDetail(accessToken: string, userId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminUserDetail> | ApiFailure>(
      `/api/admin/users/${userId}`,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getAdminInsights(accessToken: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminInsights> | ApiFailure>(
      '/api/admin/insights',
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listAdminDeliveries(
  accessToken: string,
  query: AdminDeliveriesQuery = {},
) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminDeliveriesResult> | ApiFailure>(
      '/api/admin/deliveries',
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status || undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getAdminDelivery(accessToken: string, deliveryId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminDeliveryDetail> | ApiFailure>(
      `/api/admin/deliveries/${deliveryId}`,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listAdminUserDeliveries(
  accessToken: string,
  userId: string,
  query: AdminUserDeliveriesQuery = {},
) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminUserDeliveriesResult> | ApiFailure>(
      `/api/admin/users/${userId}/deliveries`,
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status || undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listAdminPayments(accessToken: string, query: AdminPaymentsQuery = {}) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminPaymentsResult> | ApiFailure>(
      '/api/admin/payments',
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          paid: typeof query.paid === 'boolean' ? String(query.paid) : undefined,
          referenceMonth: query.referenceMonth || undefined,
          role: query.role || undefined,
          userStatus: query.userStatus || undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listAdminUserPayments(
  accessToken: string,
  userId: string,
  query: AdminUserPaymentsQuery = {},
) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AdminUserPaymentsResult> | ApiFailure>(
      `/api/admin/users/${userId}/payments`,
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          paid: typeof query.paid === 'boolean' ? String(query.paid) : undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function markAdminPaymentPaid(accessToken: string, paymentId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<AdminPaymentListItem> | ApiFailure>(
      `/api/admin/payments/${paymentId}/mark-paid`,
      undefined,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function createDeliveryRequest(
  accessToken: string,
  payload: CreateDeliveryRequestPayload,
) {
  try {
    assertApiUrlConfigured();
    const response = await api.post<ApiSuccess<DeliveryRequest> | ApiFailure>(
      '/api/deliveries',
      payload,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listMyDeliveries(accessToken: string, query: ListMyDeliveriesQuery = {}) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<StoreDeliveryListResult> | ApiFailure>(
      '/api/deliveries',
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status || undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getMyDelivery(accessToken: string, deliveryId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<StoreDeliveryDetail> | ApiFailure>(
      `/api/deliveries/${deliveryId}`,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listAvailableDeliveries(
  accessToken: string,
  query: AvailableDeliveriesQuery = {},
) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<AvailableDeliveriesResult> | ApiFailure>(
      '/api/deliveries/available',
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function acceptDelivery(accessToken: string, deliveryId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.post<ApiSuccess<AcceptedDelivery> | ApiFailure>(
      `/api/deliveries/${deliveryId}/accept`,
      undefined,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getActiveDelivery(accessToken: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<ActiveDelivery | null> | ApiFailure>(
      '/api/deliveries/active',
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function listCourierHistory(
  accessToken: string,
  query: ListCourierHistoryQuery = {},
) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<CourierDeliveryHistoryResult> | ApiFailure>(
      '/api/deliveries/history',
      {
        headers: bearerHeaders(accessToken),
        params: {
          page: query.page,
          limit: query.limit,
          status: query.status || undefined,
        },
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getCourierHistoryDelivery(accessToken: string, deliveryId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<CourierDeliveryHistoryDetail> | ApiFailure>(
      `/api/deliveries/history/${deliveryId}`,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function updateDeliveryStatus(
  accessToken: string,
  deliveryId: string,
  status: DeliveryTransitionStatus,
) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<DeliveryStatusUpdateResult> | ApiFailure>(
      `/api/deliveries/${deliveryId}/status`,
      { status },
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function getCourierStatus(accessToken: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.get<ApiSuccess<CourierOperationalStatus> | ApiFailure>(
      '/api/couriers/me/status',
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function updateCourierStatus(accessToken: string, isOnline: boolean) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<CourierOperationalStatus> | ApiFailure>(
      '/api/couriers/me/status',
      {
        isOnline,
      },
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function approveUser(accessToken: string, userId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<AuthContext['user']> | ApiFailure>(
      `/api/admin/users/${userId}/approve`,
      undefined,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function blockUser(accessToken: string, userId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<AuthContext['user']> | ApiFailure>(
      `/api/admin/users/${userId}/block`,
      undefined,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}

export async function unblockUser(accessToken: string, userId: string) {
  try {
    assertApiUrlConfigured();
    const response = await api.patch<ApiSuccess<AuthContext['user']> | ApiFailure>(
      `/api/admin/users/${userId}/unblock`,
      undefined,
      {
        headers: bearerHeaders(accessToken),
      },
    );

    return unwrapResponse(response.data);
  } catch (error) {
    mapAxiosError(error);
  }
}
