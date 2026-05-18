import type { UserRole, UserStatus } from './auth';

export type AdminPaymentRoleFilter = Extract<UserRole, 'logista' | 'motoboy'>;

export interface AdminPaymentListItem {
  id: string;
  reference_month: string;
  due_date: string;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    role: AdminPaymentRoleFilter | null;
    status: UserStatus | null;
    store_name: string | null;
  };
}

export interface AdminPaymentsResult {
  items: AdminPaymentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminPaymentsQuery {
  page?: number;
  limit?: number;
  paid?: boolean;
  referenceMonth?: string;
  role?: AdminPaymentRoleFilter;
  userStatus?: UserStatus;
}

export interface AdminUserPaymentListItem {
  id: string;
  reference_month: string;
  due_date: string;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserPaymentsResult {
  items: AdminUserPaymentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminUserPaymentsQuery {
  page?: number;
  limit?: number;
  paid?: boolean;
}
