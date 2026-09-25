"use client"

import { isOrderPaid } from "@/lib/invoice-access"
import { downloadInvoiceAsPdf } from "@/lib/invoice-download"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { DownloadIcon } from "lucide-react"
import { useState } from "react"
import { OrderDetailModal } from "./order-detail-modal"
import { OrderSummary } from "./order-summary"

type Props = {
  order: Order
  onVerifyPayment: () => void
}

export function OrderCard({ order, onVerifyPayment }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const canVerifyPayment = !isOrderPaid(order) && Number(order.status) === OrderStatus.PENDING

  return (
    <>
      <div className="bg-white border border-foreground/20 rounded-xl p-4 flex flex-col gap-3">
        <OrderSummary order={order} />

        <div className="flex flex-col gap-2 mt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsDetailOpen(true)}
              className="bg-primary text-white text-sm font-semibold py-2 rounded-lg"
            >
              Detail Pesanan
            </button>
            <button
              onClick={onVerifyPayment}
              disabled={!canVerifyPayment}
              className="bg-secondary text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verifikasi Pembayaran
            </button>
          </div>
          <button
            onClick={() => downloadInvoiceAsPdf(order)}
            className="flex items-center justify-center gap-1.5 text-sm font-medium border border-foreground/20 text-foreground/70 py-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <DownloadIcon className="size-3.5" />
            Download Invoice
          </button>
        </div>
      </div>

      {isDetailOpen && <OrderDetailModal order={order} onClose={() => setIsDetailOpen(false)} />}
    </>
  )
}
