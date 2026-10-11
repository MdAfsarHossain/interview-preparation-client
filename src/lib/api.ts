import axios, { AxiosError } from "axios";
import type { ApiResponse } from "./types";

export const ACCESS_TOKEN_KEY = "se_access_token";
/** Non-sensitive marker cookie so proxy.ts can gate routes without reading localStorage. */
export const AUTH_FLAG_COOKIE = "se_authed";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // A rejected token means the session is over — clear it so the UI stops
    // pretending the user is logged in.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      document.cookie = `${AUTH_FLAG_COOKIE}=; path=/; max-age=0`;
    }
    return Promise.reject(error);
  },
);

/** Pulls the human-readable message the Express API sends on failures. */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errorMessages?: { message: string }[] }
      | undefined;
    return (
      data?.errorMessages?.[0]?.message ||
      data?.message ||
      error.message ||
      "কিছু একটা সমস্যা হয়েছে।"
    );
  }
  if (error instanceof Error) return error.message;
  return "কিছু একটা সমস্যা হয়েছে।";
};

export const apiGet = async <T>(url: string): Promise<ApiResponse<T>> => {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data;
};

export const apiPost = async <T>(
  url: string,
  body?: unknown,
): Promise<ApiResponse<T>> => {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data;
};

export const apiPatch = async <T>(
  url: string,
  body?: unknown,
): Promise<ApiResponse<T>> => {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data;
};

/** Sends multipart/form-data (file uploads). Axios drops the header value and sets the boundary itself. */
export const apiPatchForm = async <T>(
  url: string,
  body: FormData,
): Promise<ApiResponse<T>> => {
  const { data } = await api.patch<ApiResponse<T>>(url, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
