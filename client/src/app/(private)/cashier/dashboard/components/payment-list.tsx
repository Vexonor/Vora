"use client"

import { PaymentVerificationModal } from "@/components/shared/order/payment-verification-modal"
import { dashboardService } from "@/services/dashboard.service"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type Props = {
  refreshKey?: number
  onRefresh?: () => void
}

function PaymentItem({ order, onVerified }: { order: Order; onVerified: () => void }) {
  const [showModal, setShowModal] = useState(false)

  const tableCode = `T-${String(order.table_id).padStart(2, "0")}`
  const tableName = `Meja ${String(order.table_id).padStart(2, "0")}`

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="bg-secondary text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center">
          {tableCode}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{tableName}</p>
          <p className="text-xs text-muted-foreground">Order #{order.id}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-secondary text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Verifikasi
        </button>
      </div>

      {showModal && (
        <PaymentVerificationModal
          transaction={{
            id: String(order.id),
            tableCode,
            tableName,
            total: Number(order.total_price),
          }}
          orderId={order.id}
          onClose={() => setShowModal(false)}
          onVerified={() => {
            setShowModal(false)
            onVerified()
          }}
        />
      )}
    </>
  )
}

export function PaymentList({ refreshKey, onRefresh }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await dashboardService.getPendingPayments()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders, refreshKey])

  const handleVerified = () => {
    fetchOrders()
    onRefresh?.()
  }

  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pembayaran</h4>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pembayaran yang menunggu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <PaymentItem key={order.id} order={order} onVerified={handleVerified} />
          ))}
        </div>
      )}
    </div>
  )
}
