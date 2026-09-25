import { OrderStatus, OrderType, type Order } from "@/types/order"

export function buildOrder(id: number, overrides: Partial<Order> = {}): Order {
  return {
    id,
    table_id: id,
    order_type: OrderType.DINE_IN,
    order_type_name: "Dine In",
    customer_name: null,
    total_price: 10000,
    status: OrderStatus.PENDING,
    status_name: "Pending",
    items: [],
    ...overrides,
  }
}
