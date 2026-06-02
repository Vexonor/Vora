import type { Menu } from "@/types/menu";
import apiClient from "./api-client";

const MENUS_PATH = "/menus";

export const menuService = {
  async getAll(params?: { q?: string; statuses?: number[] }): Promise<Menu[]> {
    const query: Record<string, string> = {};
    if (params?.q) query.q = params.q;
    if (params?.statuses && params.statuses.length > 0) {
      query.status = JSON.stringify(params.statuses);
    }
    return apiClient.get(MENUS_PATH, { params: query });
  },

  async getById(id: number): Promise<Menu> {
    return apiClient.get(`${MENUS_PATH}/${id}`);
  },

  /**
   * Create a new menu. Uses FormData because of image upload.
   */
  async create(data: FormData): Promise<Menu> {
    return apiClient.post(MENUS_PATH, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Update an existing menu. Uses FormData because of image upload.
   */
  async update(id: number, data: FormData): Promise<Menu> {
    return apiClient.put(`${MENUS_PATH}/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${MENUS_PATH}/${id}`);
  },
};
