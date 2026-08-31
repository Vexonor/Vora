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
  table_id: number | null;
  order_type: number;
  order_type_name: string;
  customer_name?: string | null;
  total_price: number;
  status: number;
  status_name: string;
  cancel_reason?: string | null;
  payment?: { payment_status?: string | null } | null;
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

/** Maps to server OrderTypeEnum */
export enum OrderType {
  DINE_IN = 0,
  TAKE_AWAY = 1,
}

export interface CreateOrderItemRequest {
  menu_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  order_type?: number;
  table_id?: number;
  customer_name?: string;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: number;
}

export interface CancelOrderRequest {
  reason: string;
}
