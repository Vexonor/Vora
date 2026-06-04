"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { downloadInvoiceAsPDF } from "@/lib/invoice-download"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import {
  CheckCheckIcon,
  CircleAlertIcon,
  ClockIcon,
  DownloadIcon,
  TimerIcon,
  XCircleIcon,
} from "lucide-react"

const STATUS_CONFIG: Record<number, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    badgeClass: "bg-secondary/10 text-secondary border border-secondary/30",
    icon: <ClockIcon className="size-3.5" />,
  },
  [OrderStatus.PROCESSING]: {
    label: "Diproses",
    badgeClass: "bg-secondary/10 text-secondary border border-secondary/30",
    icon: <TimerIcon className="size-3.5" />,
  },
  [OrderStatus.READY]: {
    label: "Siap Disajikan",
    badgeClass: "bg-primary/10 text-primary border border-primary/30",
    icon: <CheckCheckIcon className="size-3.5" />,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    badgeClass: "bg-primary/10 text-primary border border-primary/30",
    icon: <CheckCheckIcon className="size-3.5" />,
  },
  [OrderStatus.CANCELED]: {
    label: "Dibatalkan",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/30",
    icon: <XCircleIcon className="size-3.5" />,
  },
}

const DEFAULT_STATUS = {
  label: "Unknown",
  badgeClass: "bg-muted text-muted-foreground border border-muted",
  icon: <CircleAlertIcon className="size-3.5" />,
}

const formatCurrency = (value: number) =>
  `Rp ${Number(value).toLocaleString("id-ID")}`

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return { date: "-", time: "-" }
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }),
  }
}

type Props = {
  order: Order
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: Props) {
  const { id, table_id, total_price, status, items, created_at } = order
  const tableCode = `T-${String(table_id).padStart(2, "0")}`
  const tableName = `Meja ${String(table_id).padStart(2, "0")}`
  const statusCfg = STATUS_CONFIG[status] ?? DEFAULT_STATUS
  const { date, time } = formatDateTime(created_at)
  const itemCount = items?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">

          {/* Order info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center leading-tight">
                {tableCode}
              </div>
              <div>
                <p className="font-semibold text-sm">{tableName}</p>
                <p className="text-xs text-muted-foreground">Order #{id} · {itemCount} item</p>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${statusCfg.badgeClass}`}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>

          {/* Date & time */}
          <div className="flex justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <span>{date}</span>
            <span>{time}</span>
          </div>

          <hr className="border-foreground/10" />

          {/* Item list */}
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-xs font-semibold text-muted-foreground pb-1">
              <span>Menu</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Harga</span>
              <span className="text-right">Subtotal</span>
            </div>
            <hr className="border-foreground/10" />
            {items?.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-sm py-1">
                <span className="truncate">{item.menu?.name ?? `Menu #${item.menu_id}`}</span>
                <span className="text-center tabular-nums">{item.quantity}</span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-right tabular-nums font-medium">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-foreground/10" />

          {/* Total */}
          <div className="flex justify-between items-center font-bold text-base">
            <span>Total</span>
            <span>{formatCurrency(total_price)}</span>
          </div>

          {/* Download Invoice */}
          <Button
            variant="outline"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => downloadInvoiceAsPDF(order)}
          >
            <DownloadIcon className="size-4" />
            Download Invoice (PDF)
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}
