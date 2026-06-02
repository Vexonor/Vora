"use client";

import type { User } from "@/types/user";
import { authService } from "@/services/auth.service";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ── Context shape ────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const accessToken = response.accsess_token;
    const loggedInUser = response.user;

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    const cookieOpts = `path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `access_token=${accessToken}; ${cookieOpts}`;
    document.cookie = `user_role=${loggedInUser.role}; ${cookieOpts}`;

    setToken(accessToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "user_role=; path=/; max-age=0";

    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
