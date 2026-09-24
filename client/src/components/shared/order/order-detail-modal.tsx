"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, formatRupiah, formatTime } from "@/lib/format"
import { downloadInvoiceAsPdf } from "@/lib/invoice-download"
import { countOrderItems, getOrderItemName } from "@/lib/order"
import { getOrderPlace } from "@/lib/order-place"
import { getOrderStatusDisplay } from "@/lib/order-status"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { DownloadIcon, XCircleIcon } from "lucide-react"
import { OrderPlaceTile } from "./order-summary"

type Props = {
  order: Order
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: Props) {
  const place = getOrderPlace(order)
  const statusDisplay = getOrderStatusDisplay(order.status)
  const isCanceled = Number(order.status) === OrderStatus.CANCELED

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <OrderPlaceTile code={place.code} className="leading-tight" />
              <div>
                <p className="font-semibold text-sm">{place.name}</p>
                {order.customer_name && (
                  <p className="text-xs font-medium text-foreground/80">a.n. {order.customer_name}</p>
                )}
                <p className="text-xs text-muted-foreground">Order #{order.id} · {countOrderItems(order)} item</p>
              </div>
            </div>
            <StatusBadge
              label={statusDisplay.label}
              tone={statusDisplay.tone}
              icon={statusDisplay.icon}
              className="py-1.5 shrink-0"
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <span>{formatDate(order.created_at, "weekdayLong")}</span>
            <span>{formatTime(order.created_at)}</span>
          </div>

          {isCanceled && order.cancel_reason && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              <XCircleIcon className="size-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-destructive">Alasan pembatalan</p>
                <p className="text-foreground/80">{order.cancel_reason}</p>
              </div>
            </div>
          )}

          <hr className="border-foreground/10" />

          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-xs font-semibold text-muted-foreground pb-1">
              <span>Menu</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Harga</span>
              <span className="text-right">Subtotal</span>
            </div>
            <hr className="border-foreground/10" />
            {order.items?.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-sm py-1">
                <span className="truncate">{getOrderItemName(item)}</span>
                <span className="text-center tabular-nums">{item.quantity}</span>
                <span className="text-right tabular-nums text-muted-foreground">{formatRupiah(item.price)}</span>
                <span className="text-right tabular-nums font-medium">{formatRupiah(item.total_price)}</span>
              </div>
            ))}
          </div>

          <hr className="border-foreground/10" />

          <div className="flex justify-between items-center font-bold text-base">
            <span>Total</span>
            <span>{formatRupiah(order.total_price)}</span>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => downloadInvoiceAsPdf(order)}
          >
            <DownloadIcon className="size-4" />
            Download Invoice (PDF)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
