import type { Menu } from "./menu";

/**
 * OrderItem type matching the server OrderItem entity.
 */
export interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  price: number;
  total_price: number;
  menu?: Menu;
}

/**
 * Order type matching the server Order entity.
 */
export interface Order {
  id: number;
  table_id: number;
  customer_name?: string | null;
  total_price: number;
  status: number;
  status_name: string;
  cancel_reason?: string | null;
  items: OrderItem[];
  created_at?: string;
}

/** Maps to server OrderStatusEnum */
export enum OrderStatus {
  PENDING = 0,
  PROCESSING = 1,
  READY = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export interface CreateOrderItemRequest {
  menu_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  table_id: number;
  customer_name?: string;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: number;
}

export interface CancelOrderRequest {
  reason: string;
}
