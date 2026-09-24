import type { Order, OrderItem } from "@/types/order"

export function countOrderItems(order: Pick<Order, "items">) {
  return order.items?.reduce((total, item) => total + Number(item.quantity), 0) ?? 0
}

export function getOrderItemName(item: Pick<OrderItem, "menu" | "menu_id">) {
  return item.menu?.name ?? `Menu #${item.menu_id}`
}
