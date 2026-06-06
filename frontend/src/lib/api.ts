const BASE = "/api";

// Structured error — consumers can inspect `fields` for per-field validation messages
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** First message for a given field, or undefined */
  field(key: string): string | undefined {
    return this.fields[key]?.[0];
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Token injection is handled server-side by src/middleware.ts reading the HttpOnly cookie.
  // No Authorization header needed here — the browser sends the cookie automatically.
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const fields: Record<string, string[]> = body?.errors ?? {};
    const message =
      body?.message ??
      (Object.keys(fields).length
        ? Object.values(fields).flat().join(" ")
        : `Request failed: ${res.status}`);
    throw new ApiError(message, res.status, fields);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  is_active: boolean;
  can_custom_slug: boolean;
  is_admin: boolean;
  created_at: string;
}

// Token is set as an HttpOnly cookie by the Next.js route handler — never exposed to JS
export interface AuthResponse {
  data: AuthUser;
}

export interface MeResponse {
  data: AuthUser;
}

export const auth = {
  register: (body: {
    username: string;
    display_name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { login: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<MeResponse>("/auth/me"),
};

// ── Links ─────────────────────────────────────────────────────────────────
export interface Link {
  id: string;
  unique_id: string;
  title: string | null;
  short_url: string;
  link_target: string;
  is_protected: boolean;
  passed: number;
  click_limit: number | null;
  is_active: boolean;
  is_expired: boolean;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface LinksResponse {
  data: Link[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface LinkResponse {
  data: Link;
}

export const links = {
  list: (params?: { per_page?: number; page?: number; include_deleted?: boolean; include_expired?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.include_deleted) q.set("include_deleted", "true");
    if (params?.include_expired) q.set("include_expired", "true");
    if (params?.search) q.set("search", params.search);
    return request<LinksResponse>(`/links?${q}`);
  },

  get: (id: string) => request<LinkResponse>(`/links/${id}`),

  create: (body: { link_target: string; title?: string | null; valid_until?: string | null; custom_slug?: string | null; password?: string | null; click_limit?: number | null }) =>
    request<LinkResponse>("/links", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: { link_target?: string; title?: string | null; is_active?: boolean; valid_until?: string | null; password?: string | null; click_limit?: number | null }) =>
    request<LinkResponse>(`/links/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  verify: async (slug: string, password: string): Promise<{ url: string }> => {
    const res = await fetch(`/api/${slug}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? "Incorrect password.");
    }
    return res.json();
  },

  delete: (id: string) => request<{ message: string }>(`/links/${id}`, { method: "DELETE" }),

  bulkDelete: (ids: string[]) =>
    request<{ message: string }>("/links/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),

  bulkUpdate: (ids: string[], is_active: boolean) =>
    request<{ message: string }>("/links/bulk", { method: "PUT", body: JSON.stringify({ ids, is_active }) }),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export interface AnalyticsSeries { date: string; clicks: number }
export interface AnalyticsBreakdown { name: string; count: number }
export interface AnalyticsData {
  total_clicks: number;
  period_clicks: number;
  unique_clicks: number;
  days: number;
  series: AnalyticsSeries[];
  by_browser: AnalyticsBreakdown[];
  by_os: AnalyticsBreakdown[];
  by_device: AnalyticsBreakdown[];
  by_referrer: AnalyticsBreakdown[];
}
export interface AnalyticsResponse { data: AnalyticsData }

export const analytics = {
  get: (id: string, days = 30, offset = 0) =>
    request<AnalyticsResponse>(`/links/${id}/analytics?days=${days}&offset=${offset}`),
};

// ── Bio ───────────────────────────────────────────────────────────────────
export interface BioLink { unique_id: string; title: string; short_url: string; clicks: number }
export interface BioData {
  username: string;
  display_name: string;
  member_since: string;
  link_count: number;
  links: BioLink[];
}
export interface BioResponse { data: BioData }

// ── Admin ──────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_links: number;
  active_links: number;
  total_clicks: number;
}
export interface AdminStatsResponse { data: AdminStats }
export interface AdminUsersResponse {
  data: AuthUser[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
export interface AdminLinksResponse {
  data: Link[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const admin = {
  stats: () => request<AdminStatsResponse>('/admin/stats'),

  users: (params?: { page?: number; per_page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.per_page) q.set('per_page', String(params.per_page));
    if (params?.search) q.set('search', params.search);
    return request<AdminUsersResponse>(`/admin/users?${q}`);
  },

  updateUser: (id: string, body: { is_active?: boolean; can_custom_slug?: boolean; is_admin?: boolean }) =>
    request<UserResponse>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  links: (params?: { page?: number; per_page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.per_page) q.set('per_page', String(params.per_page));
    if (params?.search) q.set('search', params.search);
    return request<AdminLinksResponse>(`/admin/links?${q}`);
  },
};

// ── Users ─────────────────────────────────────────────────────────────────
export interface UserResponse {
  data: AuthUser;
}

export const users = {
  update: (
    id: string,
    body: { display_name?: string; email?: string; password?: string; password_confirmation?: string }
  ) => request<UserResponse>(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};
