import { OrderStatus, type Order } from "@/types/order"

export function isOrderPaid(order: Pick<Order, "payment">) {
  return order.payment?.payment_status === "settlement"
}

export function canViewInvoice(order: Pick<Order, "status" | "payment">) {
  const status = Number(order.status)
  return (
    isOrderPaid(order) ||
    status === OrderStatus.PROCESSING ||
    status === OrderStatus.READY ||
    status === OrderStatus.COMPLETED
  )
}
