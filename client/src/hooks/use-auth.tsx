"use client";

import { clearSession, readStoredSession, saveSession, saveStoredUser } from "@/lib/auth-session";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/user";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = readStoredSession();
      if (storedSession) {
        setAccessToken(storedSession.accessToken);
        setUser(storedSession.user);
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    saveSession(response.access_token, response.user);
    setAccessToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    saveStoredUser(updatedUser);
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAccessToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!accessToken && !!user,
      login,
      logout,
      updateUser,
    }),
    [user, accessToken, isLoading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
