"use client";

import { create } from "zustand";
import { ACCESS_TOKEN_KEY, AUTH_FLAG_COOKIE } from "@/lib/api";
import type { AuthUser, Role } from "@/lib/types";

const USER_KEY = "se_user";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  totalPoints: number;
};

type AuthState = {
  user: StoredUser | null;
  /** False until we've read localStorage, so guards don't redirect too early. */
  isReady: boolean;
  login: (payload: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
  setUser: (user: Partial<StoredUser>) => void;
};

const setAuthCookie = (value: boolean) => {
  if (typeof document === "undefined") return;
  document.cookie = value
    ? `${AUTH_FLAG_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 2}; samesite=lax`
    : `${AUTH_FLAG_COOKIE}=; path=/; max-age=0`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isReady: false,

  login: (payload) => {
    const user: StoredUser = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatar ?? null,
      totalPoints: payload.totalPoints ?? 0,
    };
    window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthCookie(true);
    set({ user, isReady: true });
  },

  logout: () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setAuthCookie(false);
    set({ user: null, isReady: true });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const raw = window.localStorage.getItem(USER_KEY);
    if (token && raw) {
      try {
        set({ user: JSON.parse(raw) as StoredUser, isReady: true });
        setAuthCookie(true);
        return;
      } catch {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    set({ user: null, isReady: true });
  },

  setUser: (patch) => {
    const current = get().user;
    if (!current) return;
    const next = { ...current, ...patch };
    window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    set({ user: next });
  },
}));
