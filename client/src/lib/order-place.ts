import { OrderType } from "@/types/order"

type OrderPlaceInput = {
  table_id: number | null
  order_type?: number
}

const padTableNumber = (tableNumber: number) => String(tableNumber).padStart(2, "0")

export function formatTableCode(tableNumber: number) {
  return `T-${padTableNumber(tableNumber)}`
}

export function formatTableName(tableNumber: number) {
  return `Meja ${padTableNumber(tableNumber)}`
}

export function getOrderPlace(order: OrderPlaceInput) {
  const isTakeAway = order.order_type === OrderType.TAKE_AWAY || order.table_id === null

  if (isTakeAway) {
    return { code: "TA", name: "Take Away", isTakeAway: true }
  }

  const tableNumber = Number(order.table_id)
  return { code: formatTableCode(tableNumber), name: formatTableName(tableNumber), isTakeAway: false }
}
