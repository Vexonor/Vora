import type { Table, CreateTableRequest, UpdateTableRequest } from "@/types/table";
import apiClient from "./api-client";

const TABLES_PATH = "/tables";

export const tableService = {
  async getAll(query?: Record<string, string>): Promise<Table[]> {
    const data = await apiClient.get(TABLES_PATH, { params: query });
    // Server returns { count, tables: [...] } — extract the array
    if (Array.isArray(data)) return data;
    return (data as { tables?: Table[] }).tables ?? [];
  },

  async getById(id: number): Promise<Table> {
    return apiClient.get(`${TABLES_PATH}/${id}`);
  },

  async create(data: CreateTableRequest): Promise<Table> {
    return apiClient.post(TABLES_PATH, data);
  },

  async update(id: number, data: UpdateTableRequest): Promise<Table> {
    return apiClient.put(`${TABLES_PATH}/${id}`, data);
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${TABLES_PATH}/${id}`);
  },
};
