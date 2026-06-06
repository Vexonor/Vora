import type { Stock, CreateStockRequest, UpdateStockRequest } from "@/types/stock";
import apiClient from "./api-client";

const STOCKS_PATH = "/stocks";

export const stockService = {
  async getAll(query?: Record<string, string>): Promise<{ count: number; stocks: Stock[] }> {
    return apiClient.get(STOCKS_PATH, { params: query });
  },

  async getById(id: number): Promise<Stock> {
    return apiClient.get(`${STOCKS_PATH}/${id}`);
  },

  async create(data: CreateStockRequest): Promise<Stock> {
    return apiClient.post(STOCKS_PATH, data);
  },

  async update(id: number, data: UpdateStockRequest): Promise<Stock> {
    return apiClient.put(`${STOCKS_PATH}/${id}`, data);
  },

  async remove(id: number): Promise<void> {
    return apiClient.delete(`${STOCKS_PATH}/${id}`);
  },
};
