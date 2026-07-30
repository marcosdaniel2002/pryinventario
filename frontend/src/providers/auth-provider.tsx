"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMe, login as apiLogin } from "@/features/auth/api";
import type { Usuario } from "@/features/auth/types";

const TOKEN_STORAGE_KEY = "stockhub_token";

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getMe(storedToken)
      .then((usuario) => {
        if (cancelled) return;
        setToken(storedToken);
        setUser(usuario);
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { accessToken, usuario } = await apiLogin(username, password);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(usuario);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
