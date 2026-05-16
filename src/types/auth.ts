export type UserRole = 'admin' | 'logista' | 'motoboy';
export type UserStatus = 'pendente' | 'ativo' | 'bloqueado';

export interface DomainUser {
  id: string;
  auth_id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContext {
  authUserId: string;
  user: DomainUser;
}

export interface AdminUsersQuery {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface AdminUserListItem extends DomainUser {
  store_name: string | null;
}

export interface AdminUsersResult {
  items: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminStoreProfile {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  address: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCourierProfile {
  id: string;
  user_id: string;
  full_name: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserDetail {
  user: DomainUser;
  profile: AdminStoreProfile | AdminCourierProfile | null;
}

export interface AdminInsightsPendingUser {
  id: string;
  role: Extract<UserRole, 'logista' | 'motoboy'>;
  status: Extract<UserStatus, 'pendente'>;
  created_at: string;
}

export interface AdminInsights {
  generated_at: string;
  user_counts: Record<UserRole, Record<UserStatus, number>>;
  active_accounts: {
    stores: number;
    couriers: number;
  };
  latest_pending_users: {
    limit: number;
    items: AdminInsightsPendingUser[];
  };
}

export interface StoreRegistrationPayload {
  email: string;
  password: string;
  store: {
    name: string;
    ownerName: string;
    address: string;
    description?: string;
  };
}

export interface CourierRegistrationPayload {
  email: string;
  password: string;
  courier: {
    fullName: string;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface RegistrationResult<TProfile> {
  user: DomainUser;
  profile: TProfile;
}

export interface StoreProfile {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  address: string;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourierProfile {
  id: string;
  user_id: string;
  full_name: string;
  bike_photo_url: string | null;
  license_photo_url: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourierOperationalStatus {
  is_online: boolean;
  updated_at: string;
}
