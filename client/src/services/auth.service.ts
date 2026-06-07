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

  /**
   * Update the logged-in user's own profile (username, email, avatar).
   * Uses FormData because of the avatar image upload. Role is not editable.
   */
  async updateProfile(data: FormData): Promise<User> {
    return apiClient.patch(`${AUTH_PATH}/profile`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
