"use client"

import { PaymentVerificationModal } from "@/components/shared/order/payment-verification-modal"
import { useCashierPendingPayments } from "@/hooks/queries/use-dashboard"
import { getOrderPlace } from "@/lib/order-place"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

function PendingPaymentRow({ order, onVerify }: { order: Order; onVerify: () => void }) {
  const place = getOrderPlace(order)

  return (
    <div className="flex items-center gap-3">
      <div className="bg-secondary text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center">
        {place.code}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{place.name}</p>
        <p className="text-xs text-muted-foreground">Order #{order.id}</p>
      </div>
      <button
        onClick={onVerify}
        className="bg-secondary text-white text-xs font-semibold px-4 py-2 rounded-lg"
      >
        Verifikasi
      </button>
    </div>
  )
}

export function PendingPaymentList() {
  const pendingPaymentsQuery = useCashierPendingPayments()
  const orders = pendingPaymentsQuery.data ?? []
  const [orderToVerify, setOrderToVerify] = useState<Order | null>(null)

  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pembayaran</h4>
      {pendingPaymentsQuery.isPending ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pembayaran yang menunggu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <PendingPaymentRow key={order.id} order={order} onVerify={() => setOrderToVerify(order)} />
          ))}
        </div>
      )}

      {orderToVerify && (
        <PaymentVerificationModal order={orderToVerify} onClose={() => setOrderToVerify(null)} />
      )}
    </div>
  )
}
