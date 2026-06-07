import type { User, UpdateUserRequest } from "@/types/user";
import apiClient from "./api-client";

const USERS_PATH = "/manager/users";

export const userService = {
  async getAll(params?: { q?: string; roles?: number[] }): Promise<User[]> {
    const query: Record<string, string> = {};
    if (params?.q) query.q = params.q;
    if (params?.roles && params.roles.length > 0) {
      query.role = JSON.stringify(params.roles);
    }
    return apiClient.get(USERS_PATH, { params: query });
  },

  async getById(id: number): Promise<User> {
    return apiClient.get(`${USERS_PATH}/${id}`);
  },

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    return apiClient.patch(`${USERS_PATH}/${id}`, data);
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${USERS_PATH}/${id}`);
  },
};
