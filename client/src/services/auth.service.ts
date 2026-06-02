import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth";
import type { User } from "@/types/user";
import apiClient from "./api-client";

const AUTH_PATH = "/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post(`${AUTH_PATH}/login`, credentials);
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post(`${AUTH_PATH}/register`, data);
  },

  async getMe(): Promise<User> {
    return apiClient.get(`${AUTH_PATH}/me`);
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.patch(`${AUTH_PATH}/change-password`, data);
  },
};
