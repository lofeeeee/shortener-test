"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, type AuthUser } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    display_name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await auth.me();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  // On mount, check the HttpOnly cookie by hitting /api/auth/me.
  // The Next.js middleware injects the Authorization header from the cookie.
  useEffect(() => {
    auth.me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await auth.login({ login: identifier, password });
    setUser(res.data);
  };

  const register = async (data: Parameters<typeof auth.register>[0]) => {
    const res = await auth.register(data);
    setUser(res.data);
  };

  const logout = async () => {
    try { await auth.logout(); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
