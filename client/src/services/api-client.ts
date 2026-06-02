import axios from "axios";
import type { ApiResponse } from "@/types/api";

const BASE_URL = "/api/v1";

/**
 * Configured Axios instance for the Vora API.
 *
 * - Automatically attaches JWT token from localStorage.
 * - Unwraps the `{ statusCode, message, data }` envelope on success.
 * - Redirects to /login on 401 Unauthorized.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

// ── Request Interceptor ──────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the API envelope — return only `data` field
    const body = response.data as ApiResponse<unknown>;
    return body.data as never;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
