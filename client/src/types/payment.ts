export enum PaymentType {
  ONLINE = 0,
  OFFLINE = 1,
}

export type Payment = {
  id: number
  order_id: number
  midtrans_transaction_id: string | null
  total: number
  paid: number
  change_amount: number
  type: number // PaymentType enum
  qr_image_url: string | null
  payment_status: string | null
  snap_token: string | null
  snap_redirect_url: string | null
  created_at?: string
}

/** Hasil verifikasi pembayaran tunai yang dikembalikan server. */
export type CashPaymentResult = {
  total: number
  paid: number
  change_amount: number
}
