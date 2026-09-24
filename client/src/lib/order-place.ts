import { OrderType } from "@/types/order"

export type OrderPlaceInput = {
  table_id: number | null
  order_type?: number
}

export function getOrderPlace(order: OrderPlaceInput) {
  const isTakeAway =
    order.order_type === OrderType.TAKE_AWAY || order.table_id === null

  if (isTakeAway) {
    return { code: "TA", name: "Take Away", isTakeAway: true }
  }

  const padded = String(order.table_id).padStart(2, "0")
  return { code: `T-${padded}`, name: `Meja ${padded}`, isTakeAway: false }
}