"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Order, OrderItem } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { MessageSquareIcon } from "lucide-react"
import Image from "next/image"

type Props = {
  order: Order
  onClose: () => void
  onComplete: () => void
}

function MenuItemCard({ item }: { item: OrderItem }) {
  return (
    <div className="flex flex-col gap-2 border border-foreground/10 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
            {item.menu?.image_url
              ? <Image src={item.menu.image_url} alt={item.menu.name} fill className="object-cover" />
              : (item.menu?.name?.[0] ?? "?")
            }
          </div>
          <p className="font-semibold text-sm">{item.menu?.name ?? `Menu #${item.menu_id}`}</p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground shrink-0">{item.quantity}x</span>
      </div>
      <div className="flex items-center gap-2 border border-foreground/15 rounded-lg px-3 py-2">
        <MessageSquareIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          Tidak ada note untuk menu ini
        </span>
      </div>
    </div>
  )
}

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

export function OrderDetailModal({ order, onClose, onComplete }: Props) {
  const status = Number(order.status)
  const canAct = status === OrderStatus.PENDING || status === OrderStatus.PROCESSING
  const actionLabel = status === OrderStatus.PENDING ? "Proses Pesanan" : "Selesaikan Pesanan"
  const tableCode = `T-${String(order.table_id).padStart(2, "0")}`
  const tableName = `Meja ${String(order.table_id).padStart(2, "0")}`
  const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0
  const items = order.items ?? []

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-w-sm sm:min-w-xl md:min-w-2xl lg:min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail pesanan</DialogTitle>
        </DialogHeader>

        {/* Info Pemesanan */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-muted-foreground">Informasi Pemesanan</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
                {tableCode}
              </div>
              <div>
                <p className="font-semibold text-sm">{tableName}</p>
                <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                <p className="text-xs text-muted-foreground">{itemCount} items</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{formatDate(order.created_at)}</p>
              <p>{formatTime(order.created_at)}</p>
            </div>
          </div>
        </div>

        <hr className="border-foreground/10" />

        {/* Menu Items */}
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">Item Pesanan</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        {canAct && (
          <div className="flex justify-end pt-2">
            <Button onClick={onComplete} className="bg-secondary text-white hover:bg-secondary/90">
              {actionLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}