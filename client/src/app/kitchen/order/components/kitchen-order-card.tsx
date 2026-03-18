"use client"

import { KITCHEN_STATUS_CONFIG, KitchenOrder, KitchenStatus } from "@/lib/constant/kitchen-order"
import { CheckCheckIcon, CircleAlertIcon, CircleCheckIcon, TimerIcon } from "lucide-react"
import { useState } from "react"
import { ConfirmCompleteModal } from "./confirm-complete-modal"
import { OrderDetailModal } from "./order-detail-modal"

const STATUS_ICON: Record<KitchenStatus, React.ReactNode> = {
  process: <TimerIcon className="size-3.5" />,
  paid: <CircleCheckIcon className="size-3.5" />,
  unpaid: <CircleAlertIcon className="size-3.5" />,
  unverified: <CircleAlertIcon className="size-3.5" />,
  ready: <CheckCheckIcon className="size-3.5" />,
}

const formatCurrency = (value: number) => value.toLocaleString("id-ID")

// Status yang boleh diselesaikan
const CAN_COMPLETE: KitchenStatus[] = ["process", "paid"]

export function KitchenOrderCard(props: KitchenOrder) {
  const { tableCode, tableName, itemCount, status, date, time, items, subtotal, tax, total } = props
  const [showDetail, setShowDetail] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const config = KITCHEN_STATUS_CONFIG[status]
  const canComplete = CAN_COMPLETE.includes(status)

  const handleConfirm = () => {
    // TODO: handle API call untuk update status
    setShowConfirm(false)
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
              {STATUS_ICON[status]}
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
          <span>{date}</span>
          <span>{time}</span>
        </div>

        <hr className="border-foreground/10" />

        {/* Menu Table */}
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-3 text-xs text-muted-foreground">
            <span>Menu</span>
            <span className="text-center">Jumlah</span>
            <span className="text-right">Harga</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 text-sm">
              <span>{item.name}</span>
              <span className="text-center">{item.qty}</span>
              <span className="text-right">{formatCurrency(item.qty * (total / itemCount))}</span>
            </div>
          ))}
        </div>

        <hr className="border-foreground/10" />

        {/* Summary */}
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>PPN (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-1">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
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
            onClick={() => canComplete && setShowConfirm(true)}
            disabled={!canComplete}
            className="bg-secondary text-white text-sm font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selesaikan Pesanan
          </button>
        </div>

      </div>

      {showDetail && (
        <OrderDetailModal
          order={props}
          onClose={() => setShowDetail(false)}
          onComplete={() => { setShowDetail(false); setShowConfirm(true) }}
        />
      )}

      {showConfirm && (
        <ConfirmCompleteModal
          tableName={tableName}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}