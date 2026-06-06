import type { Order, CreateOrderRequest, UpdateOrderStatusRequest, CancelOrderRequest } from "@/types/order";
import apiClient from "./api-client";

const ORDERS_PATH = "/orders";

export const orderService = {
  async getAll(params?: { status?: number; statuses?: number[]; search?: string }): Promise<Order[]> {
    const query: Record<string, string> = {};
    if (params?.statuses && params.statuses.length > 0) {
      query.status = JSON.stringify(params.statuses);
    } else if (params?.status !== undefined) {
      query.status = String(params.status);
    }
    if (params?.search) query.search = params.search;
    return apiClient.get(ORDERS_PATH, { params: query });
  },

  async getById(id: number): Promise<Order> {
    return apiClient.get(`${ORDERS_PATH}/${id}`);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    return apiClient.post(ORDERS_PATH, data);
  },

  async updateStatus(id: number, data: UpdateOrderStatusRequest): Promise<Order> {
    return apiClient.patch(`${ORDERS_PATH}/${id}/status`, data);
  },

  async cancel(id: number, data: CancelOrderRequest): Promise<Order> {
    return apiClient.patch(`${ORDERS_PATH}/${id}/cancel`, data);
  },
};
