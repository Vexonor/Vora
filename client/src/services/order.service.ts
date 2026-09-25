import { sliceOrderPage } from "@/lib/order-list-page";
import { createTimedPromiseCache } from "@/lib/timed-promise-cache";
import type {
  CancelOrderRequest,
  CreateOrderRequest,
  Order,
  OrderPage,
  OrderPageParams,
  UpdateOrderStatusRequest,
} from "@/types/order";
import apiClient from "./api-client";

const ORDERS_PATH = "/orders";
const ORDER_LIST_CACHE_TTL_MS = 5_000;

const allOrdersCache = createTimedPromiseCache<Order[]>(ORDER_LIST_CACHE_TTL_MS);

export const orderService = {
  async getAll(params?: { statuses?: number[] }): Promise<Order[]> {
    const query: Record<string, string> = {};
    if (params?.statuses && params.statuses.length > 0) {
      query.status = JSON.stringify(params.statuses);
    }
    return apiClient.get(ORDERS_PATH, { params: query });
  },

  async getPage({ page, limit, statuses, search }: OrderPageParams): Promise<OrderPage> {
    const orders = await allOrdersCache.load(
      JSON.stringify(statuses),
      () => orderService.getAll({ statuses }),
      { forceRefresh: page === 1 },
    );
    return sliceOrderPage(Array.isArray(orders) ? orders : [], { page, limit, search });
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
