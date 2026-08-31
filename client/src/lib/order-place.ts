import { OrderType } from "@/types/order"

export type OrderPlaceInput = {
  table_id: number | null
  order_type?: number
}

/**
 * Label tempat sebuah pesanan: nomor meja untuk Dine In, atau penanda Take Away.
 * Sebelumnya pola `T-xx` / `Meja xx` disalin di enam berkas; semuanya sekarang
 * memanggil helper ini agar cabang Take Away hanya ada di satu tempat.
 *
 * Catatan: angka yang ditampilkan adalah `table_id`, bukan `table.number`.
 * Itu perilaku yang sudah berjalan sejak awal dan sengaja dipertahankan di sini.
 */
export function getOrderPlace(order: OrderPlaceInput) {
  const isTakeAway =
    order.order_type === OrderType.TAKE_AWAY || order.table_id === null

  if (isTakeAway) {
    return { code: "TA", name: "Take Away", isTakeAway: true }
  }

  const padded = String(order.table_id).padStart(2, "0")
  return { code: `T-${padded}`, name: `Meja ${padded}`, isTakeAway: false }
}