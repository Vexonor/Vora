import type { Unit, CreateUnitRequest, UpdateUnitRequest } from "@/types/unit";
import apiClient from "./api-client";

const UNITS_PATH = "/units";

export const unitService = {
  async getAll(query?: Record<string, string>): Promise<Unit[]> {
    const res = await apiClient.get(UNITS_PATH, { params: query }) as any;
    return res.units || res;
  },

  async getById(id: number): Promise<Unit> {
    return apiClient.get(`${UNITS_PATH}/${id}`);
  },

  async create(data: CreateUnitRequest): Promise<Unit> {
    return apiClient.post(UNITS_PATH, data);
  },

  async update(id: number, data: UpdateUnitRequest): Promise<Unit> {
    return apiClient.put(`${UNITS_PATH}/${id}`, data);
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${UNITS_PATH}/${id}`);
  },
};
