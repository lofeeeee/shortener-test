"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, type AuthUser } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
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

function setTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
}

function clearTokenCookie() {
  document.cookie = "token=; path=/; SameSite=Lax; max-age=0";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await auth.me();
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      clearTokenCookie();
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setTokenCookie(stored);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const res = await auth.login({ login: identifier, password });
    localStorage.setItem("token", res.token);
    setTokenCookie(res.token);
    setToken(res.token);
    setUser(res.data);
  };

  const register = async (data: Parameters<typeof auth.register>[0]) => {
    const res = await auth.register(data);
    localStorage.setItem("token", res.token);
    setTokenCookie(res.token);
    setToken(res.token);
    setUser(res.data);
  };

  const logout = async () => {
    try { await auth.logout(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    clearTokenCookie();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
