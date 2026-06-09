"use client"

import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { CheckCheckIcon, CircleAlertIcon, CircleCheckIcon, ClockIcon, TimerIcon } from "lucide-react"
import { useState } from "react"
import { CancelOrderModal } from "./cancel-order-modal"
import { ConfirmCompleteModal } from "./confirm-complete-modal"
import { OrderDetailModal } from "./order-detail-modal"

/** Map API order status to UI config */
const STATUS_CONFIG: Record<number, {
  label: string
  description: string
  buttonClass: string
  dotClass: string
  icon: React.ReactNode
}> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    description: "Menunggu diproses",
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    icon: <ClockIcon className="size-3.5" />,
  },
  [OrderStatus.PROCESSING]: {
    label: "Diproses",
    description: "Sedang diproses",
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    icon: <TimerIcon className="size-3.5" />,
  },
  [OrderStatus.READY]: {
    label: "Siap",
    description: "Siap disajikan",
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
    icon: <CheckCheckIcon className="size-3.5" />,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    description: "Pesanan selesai",
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
    icon: <CircleCheckIcon className="size-3.5" />,
  },
  [OrderStatus.CANCELED]: {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan",
    buttonClass: "border border-destructive text-destructive",
    dotClass: "bg-destructive",
    icon: <CircleAlertIcon className="size-3.5" />,
  },
}

const DEFAULT_CONFIG = {
  label: "Unknown",
  description: "",
  buttonClass: "border border-foreground/30 text-foreground",
  dotClass: "bg-foreground/30",
  icon: <CircleAlertIcon className="size-3.5" />,
}

const formatCurrency = (value: number) => Number(value).toLocaleString("id-ID")

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  })
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  })
}

type Props = {
  order: Order
  onUpdateStatus?: (orderId: number, newStatus: number) => void
  onCancel?: (orderId: number, reason: string) => void | Promise<void>
}

export function KitchenOrderCard({ order, onUpdateStatus, onCancel }: Props) {
  const { id, table_id, total_price, items, created_at } = order
  const status = Number(order.status)
  const [showDetail, setShowDetail] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG
  const canAct =
    status === OrderStatus.PENDING ||
    status === OrderStatus.PROCESSING ||
    status === OrderStatus.READY
  const canCancel =
    status === OrderStatus.PENDING || status === OrderStatus.PROCESSING
  const actionLabel =
    status === OrderStatus.PENDING ? "Proses Pesanan"
      : status === OrderStatus.PROCESSING ? "Tandai Siap"
        : "Selesaikan Pesanan"
  const tableCode = `T-${String(table_id).padStart(2, "0")}`
  const tableName = `Meja ${String(table_id).padStart(2, "0")}`
  const itemCount = items?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0

  const handleActionClick = () => {
    if (status === OrderStatus.PENDING) {
      onUpdateStatus?.(id, OrderStatus.PROCESSING)
    } else if (status === OrderStatus.PROCESSING) {
      onUpdateStatus?.(id, OrderStatus.READY)
    } else if (status === OrderStatus.READY) {
      setShowConfirm(true)
    }
  }

  const handleConfirm = () => {
    onUpdateStatus?.(id, OrderStatus.COMPLETED)
    setShowConfirm(false)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!onCancel) return
    setIsCanceling(true)
    try {
      await onCancel(id, reason)
      setShowCancel(false)
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-foreground/20 rounded-xl p-4 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
              {tableCode}
            </div>
            <div>
              <p className="font-semibold text-sm">{tableName}</p>
              <p className="text-xs text-muted-foreground">{itemCount} items</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${config.buttonClass}`}>
              {config.icon}
              {config.label}
            </button>
            <div className="flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${config.dotClass}`} />
              <span className="text-xs text-muted-foreground">{config.description}</span>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(created_at)}</span>
          <span>{formatTime(created_at)}</span>
        </div>

        <hr className="border-foreground/10" />

        {/* Menu Table */}
        <div className="flex flex-1 flex-col gap-1 min-h-0">
          <div className="grid grid-cols-3 text-xs text-muted-foreground">
            <span>Menu</span>
            <span className="text-center">Jumlah</span>
            <span className="text-right">Harga</span>
          </div>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
            {items?.map((item) => (
              <div key={item.id} className="grid grid-cols-3 text-sm">
                <span>{item.menu?.name ?? `Menu #${item.menu_id}`}</span>
                <span className="text-center">{item.quantity}</span>
                <span className="text-right">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-foreground/10" />

        {/* Summary */}
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between font-bold text-base mt-1">
            <span>Total</span>
            <span>{formatCurrency(total_price)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => setShowDetail(true)}
            className="bg-primary text-white text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Detail Pesanan
          </button>
          <button
            onClick={handleActionClick}
            disabled={!canAct}
            className="bg-secondary text-white text-sm font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {actionLabel}
          </button>
        </div>

        {canCancel && onCancel ? (
          <button
            onClick={() => setShowCancel(true)}
            className="text-sm font-semibold py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/5 transition-colors"
          >
            Batalkan Pesanan
          </button>
        ) : (
          // Reserve the cancel-button row so action buttons stay aligned across cards
          <div aria-hidden className="h-9.5" />
        )}

      </div>

      {showDetail && (
        <OrderDetailModal
          order={order}
          onClose={() => setShowDetail(false)}
          onComplete={() => {
            setShowDetail(false)
            handleActionClick()
          }}
        />
      )}

      {showConfirm && (
        <ConfirmCompleteModal
          tableName={tableName}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
        />
      )}

      {showCancel && (
        <CancelOrderModal
          tableName={tableName}
          isSubmitting={isCanceling}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  )
}