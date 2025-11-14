// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import AuthAPI from "@/lib/api/types/auth"; // existing auth API helper (login/refresh endpoints)
import { AuthService } from "@/lib/api/generated/services/AuthService";
import type { AxiosResponse } from "axios";

/**
 * Local user shape used by the frontend.
 * Keep it permissive because backend shapes vary between environments.
 */
export type UserRole = "admin" | "user" | "instructor" | string;

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: UserRole;
  avatarUrl?: string | null;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const STORAGE = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
  USER: "edulearn_user",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper: normalize various backend user payload shapes to our `User`
 */
function normalizeUser(raw: any): User {
  if (!raw) return { id: "", email: "" };

  const id = raw.id ?? raw.userId ?? raw.user_id ?? raw.uuid ?? raw.sub ?? "";
  const email = raw.email ?? raw.emailAddress ?? raw.mail ?? "";
  const fullName = raw.fullName ?? raw.name ?? raw.full_name ?? raw.displayName ?? "";
  const role = (raw.role ?? raw.roles?.[0] ?? raw.platformRole ?? raw.isAdmin ? "admin" : undefined) as UserRole | undefined;
  const avatarUrl = raw.avatarUrl ?? raw.avatar ?? raw.profilePicture ?? null;

  return {
    id,
    email,
    fullName,
    role,
    avatarUrl,
    ...raw,
  };
}

/**
 * Fetch /api/v1/users/profile using axios (assumes Authorization header is set when token exists).
 * Returns normalized User or null.
 */
async function fetchProfileFromServer(): Promise<User | null> {
  try {
    const resp: AxiosResponse<any> = await axios.get("/api/v1/users/profile");
    const body = resp?.data ?? resp;
    // If API wraps in { data: { ... } } or ApiWrapper, attempt to find raw object
    const rawUser = body?.data ?? body;
    if (!rawUser) return null;
    return normalizeUser(rawUser);
  } catch (err) {
    // 401 or network error -> no profile
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem(STORAGE.ACCESS);
    if (!token) {
      localStorage.removeItem(STORAGE.USER);
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE.USER);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: ensure axios auth header if token present, then refresh profile from backend.
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const token = localStorage.getItem(STORAGE.ACCESS);
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const profile = await fetchProfileFromServer();
        if (profile) {
          localStorage.setItem(STORAGE.USER, JSON.stringify(profile));
          setUser(profile);
        } else {
          // token invalid / expired -> clear stored user but keep tokens for refresh flow
          // (optional) you could attempt refreshAccessToken() here
          setUser(null);
          localStorage.removeItem(STORAGE.USER);
        }
      } else {
        // no token -> ensure cleared state
        setUser(null);
        localStorage.removeItem(STORAGE.USER);
      }
      setIsLoading(false);
    }

    init();
  }, []);

  /* LOGIN - Optimized for speed */
  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const payload = {
        identifier: identifier.trim(),
        password,
        deviceId: "web-client",
        rememberMe: true,
      };

      const res: any = await AuthAPI.loginUser(payload);
      const data = res?.data ?? res;

      // Extract tokens
      const accessToken = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken;
      const refreshToken = data?.refreshToken ?? data?.refresh_token ?? data?.data?.refreshToken;

      if (accessToken) {
        localStorage.setItem(STORAGE.ACCESS, accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      } else {
        throw new Error("No access token in response");
      }
      
      if (refreshToken) {
        localStorage.setItem(STORAGE.REFRESH, refreshToken);
      }

      // Try to get user from response first (fastest path)
      const userRaw = data?.user ?? data?.data?.user ?? data?.data ?? data;
      const normalized = normalizeUser(userRaw);
      
      if (normalized && normalized.id) {
        // User data was in login response - cache and return immediately
        localStorage.setItem(STORAGE.USER, JSON.stringify(normalized));
        setUser(normalized);
        setIsLoading(false);
        return normalized;
      }

      // Fallback: fetch profile in background (don't wait for this)
      fetchProfileFromServer()
        .then((profile) => {
          if (profile) {
            localStorage.setItem(STORAGE.USER, JSON.stringify(profile));
            setUser(profile);
          }
        })
        .catch(() => {
          // Silent catch - profile fetch failed but login succeeded
        });

      // Return what we have from login response
      const basicUser = { id: userRaw?.id ?? "user", email: userRaw?.email ?? "" };
      setUser(basicUser as User);
      setIsLoading(false);
      return basicUser as User;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  /* REFRESH ACCESS TOKEN */
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(STORAGE.REFRESH);
    if (!refreshToken) return;
    try {
      const res: any = await AuthAPI.refreshToken(refreshToken);
      const data = res?.data ?? res;
      const newAccess = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken;
      if (newAccess) {
        localStorage.setItem(STORAGE.ACCESS, newAccess);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      } else {
        // failed to obtain new token -> log out
        await logout();
      }
    } catch (err) {
      console.warn("refreshAccessToken failed", err);
      await logout();
    }
  };

  /* REFRESH USER PROFILE (exposed to components) */
  const refreshUser = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const profile = await fetchProfileFromServer();
      if (profile) {
        localStorage.setItem(STORAGE.USER, JSON.stringify(profile));
        setUser(profile);
        return profile;
      } else {
        // couldn't fetch profile
        setUser(null);
        localStorage.removeItem(STORAGE.USER);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* LOGOUT */
  const logout = async () => {
    const refreshToken = localStorage.getItem(STORAGE.REFRESH) ?? undefined;
    try {
      // Prefer using generated AuthService which matches OpenAPI
      try {
        await AuthService.postApiV1AuthLogout({ refreshToken });
      } catch (err) {
        // If logout endpoint not available or returns non-2xx, ignore — still clear local state
        console.warn("logout endpoint error (ignored):", err);
      }
    } finally {
      // Always clear local auth state
      localStorage.removeItem(STORAGE.ACCESS);
      localStorage.removeItem(STORAGE.REFRESH);
      localStorage.removeItem(STORAGE.USER);
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshAccessToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
