"use client"

import { OrderStatus, STATUS_CONFIG, Transaction } from "@/lib/constant/order"
import { CheckCheckIcon, CircleAlertIcon, TimerIcon } from "lucide-react"
import { useState } from "react"
import { PaymentVerificationModal } from "./payment-verification-modal"

const STATUS_ICON: Record<OrderStatus, React.ReactNode> = {
  siap: <CheckCheckIcon className="size-3.5" />,
  proses: <TimerIcon className="size-3.5" />,
  belum_bayar: <CircleAlertIcon className="size-3.5" />,
}

const formatCurrency = (value: number) =>
  value.toLocaleString("id-ID")

export function TransactionCard(props: Transaction) {
  const { tableCode, tableName, itemCount, status, date, time, items, subtotal, tax, total } = props
  const [showModal, setShowModal] = useState(false)
  const config = STATUS_CONFIG[status]

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
          {items.map((item) => (
            <div key={item.name} className="grid grid-cols-3 text-sm">
              <span>{item.name}</span>
              <span className="text-center">{item.qty}</span>
              <span className="text-right">{formatCurrency(item.price)}</span>
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
          <button className="bg-primary text-white text-sm font-semibold py-2 rounded-lg">
            Detail Pesanan
          </button>
          <button onClick={() => setShowModal(true)} className="bg-secondary text-white text-sm font-semibold py-2 rounded-lg">
            Verifikasi Pembayaran
          </button>
        </div>

      </div>

      {showModal && (
        <PaymentVerificationModal
          transaction={props}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}