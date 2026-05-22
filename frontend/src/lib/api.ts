const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.message ??
      (body?.errors
        ? Object.values(body.errors as Record<string, string[]>)
            .flat()
            .join(" ")
        : `Request failed: ${res.status}`);
    throw new Error(message);
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
  created_at: string;
}

export interface AuthResponse {
  data: AuthUser;
  token: string;
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
  short_url: string;
  link_target: string;
  passed: number;
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
  list: (params?: { per_page?: number; page?: number; include_deleted?: boolean; include_expired?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.include_deleted) q.set("include_deleted", "true");
    if (params?.include_expired) q.set("include_expired", "true");
    return request<LinksResponse>(`/links?${q}`);
  },

  get: (id: string) => request<LinkResponse>(`/links/${id}`),

  create: (body: { link_target: string; valid_until?: string | null }) =>
    request<LinkResponse>("/links", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: { link_target?: string; is_active?: boolean; valid_until?: string | null }) =>
    request<LinkResponse>(`/links/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request<{ message: string }>(`/links/${id}`, { method: "DELETE" }),
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
