"use client"

import { OrderSummary } from "@/components/shared/order/order-summary"
import { useCancelOrder, useUpdateOrderStatus } from "@/hooks/queries/use-orders"
import { getApiErrorMessage } from "@/lib/api-error"
import { getOrderPlace } from "@/lib/order-place"
import { canKitchenCancelOrder, getKitchenNextAction } from "@/lib/order-status"
import type { Order } from "@/types/order"
import { useState } from "react"
import { toast } from "sonner"
import { CancelOrderDialog } from "./cancel-order-dialog"
import { CompleteOrderDialog } from "./complete-order-dialog"
import { KitchenOrderDetailModal } from "./kitchen-order-detail-modal"

export function KitchenOrderCard({ order }: { order: Order }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const updateOrderStatus = useUpdateOrderStatus()
  const cancelOrder = useCancelOrder()

  const status = Number(order.status)
  const nextAction = getKitchenNextAction(status)
  const canCancel = canKitchenCancelOrder(status)
  const placeName = getOrderPlace(order).name

  const moveToNextStatus = () => {
    if (!nextAction) return
    updateOrderStatus.mutate(
      { orderId: order.id, status: nextAction.nextStatus },
      { onError: () => toast.error("Gagal memperbarui status pesanan. Coba lagi.") },
    )
  }

  const handleAdvanceStatus = () => {
    if (!nextAction) return
    if (nextAction.requiresConfirmation) setIsCompleteDialogOpen(true)
    else moveToNextStatus()
  }

  const handleConfirmComplete = () => {
    moveToNextStatus()
    setIsCompleteDialogOpen(false)
  }

  const handleConfirmCancel = (reason: string) => {
    cancelOrder.mutate(
      { orderId: order.id, reason },
      {
        onSuccess: () => {
          toast.success("Pesanan berhasil dibatalkan.")
          setIsCancelDialogOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal membatalkan pesanan. Coba lagi.")),
      },
    )
  }

  return (
    <>
      <div className="bg-white border border-foreground/20 rounded-xl p-4 flex flex-col gap-3">
        <OrderSummary order={order} />

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => setIsDetailOpen(true)}
            className="bg-primary text-white text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Detail Pesanan
          </button>
          <button
            onClick={handleAdvanceStatus}
            disabled={!nextAction}
            className="bg-secondary text-white text-sm font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {nextAction?.label ?? "Selesaikan Pesanan"}
          </button>
        </div>

        {canCancel ? (
          <button
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-sm font-semibold py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/5 transition-colors"
          >
            Batalkan Pesanan
          </button>
        ) : (
          <div aria-hidden className="h-9.5" />
        )}
      </div>

      {isDetailOpen && (
        <KitchenOrderDetailModal
          order={order}
          nextActionLabel={nextAction?.label ?? null}
          onClose={() => setIsDetailOpen(false)}
          onAdvanceStatus={() => {
            setIsDetailOpen(false)
            handleAdvanceStatus()
          }}
        />
      )}

      {isCompleteDialogOpen && (
        <CompleteOrderDialog
          placeName={placeName}
          onConfirm={handleConfirmComplete}
          onClose={() => setIsCompleteDialogOpen(false)}
        />
      )}

      {isCancelDialogOpen && (
        <CancelOrderDialog
          placeName={placeName}
          isSubmitting={cancelOrder.isPending}
          onConfirm={handleConfirmCancel}
          onClose={() => setIsCancelDialogOpen(false)}
        />
      )}
    </>
  )
}
