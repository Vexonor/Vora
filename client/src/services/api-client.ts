import axios from "axios";
import { clearSession, readAccessToken } from "@/lib/auth-session";
import type { ApiResponse } from "@/types/api";

const API_BASE_PATH = "/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const accessToken = readAccessToken();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => (response.data as ApiResponse<unknown>).data as never,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
