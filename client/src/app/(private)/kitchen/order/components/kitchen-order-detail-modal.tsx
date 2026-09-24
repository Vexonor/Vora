"use client"

import { OrderPlaceTile } from "@/components/shared/order/order-summary"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, formatTime } from "@/lib/format"
import { countOrderItems, getOrderItemName } from "@/lib/order"
import { getOrderPlace } from "@/lib/order-place"
import type { Order, OrderItem } from "@/types/order"
import { MessageSquareIcon } from "lucide-react"
import Image from "next/image"

function OrderItemCard({ item }: { item: OrderItem }) {
  const itemName = getOrderItemName(item)

  return (
    <div className="flex flex-col gap-2 border border-foreground/10 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
            {item.menu?.image_url
              ? <Image src={item.menu.image_url} alt={itemName} fill className="object-cover" />
              : itemName.charAt(0)}
          </div>
          <p className="font-semibold text-sm">{itemName}</p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground shrink-0">{item.quantity}x</span>
      </div>
      <div className="flex items-center gap-2 border border-foreground/15 rounded-lg px-3 py-2">
        <MessageSquareIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Tidak ada note untuk menu ini</span>
      </div>
    </div>
  )
}

type Props = {
  order: Order
  nextActionLabel: string | null
  onClose: () => void
  onAdvanceStatus: () => void
}

export function KitchenOrderDetailModal({ order, nextActionLabel, onClose, onAdvanceStatus }: Props) {
  const place = getOrderPlace(order)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-w-sm sm:min-w-xl md:min-w-2xl lg:min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail pesanan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-muted-foreground">Informasi Pemesanan</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <OrderPlaceTile code={place.code} />
              <div>
                <p className="font-semibold text-sm">{place.name}</p>
                {order.customer_name && (
                  <p className="text-xs font-medium text-foreground/80">a.n. {order.customer_name}</p>
                )}
                <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                <p className="text-xs text-muted-foreground">{countOrderItems(order)} items</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{formatDate(order.created_at, "weekday", "")}</p>
              <p>{formatTime(order.created_at, {}, "")}</p>
            </div>
          </div>
        </div>

        <hr className="border-foreground/10" />

        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">Item Pesanan</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {order.items?.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {nextActionLabel && (
          <div className="flex justify-end pt-2">
            <Button onClick={onAdvanceStatus} className="bg-secondary text-white hover:bg-secondary/90">
              {nextActionLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
