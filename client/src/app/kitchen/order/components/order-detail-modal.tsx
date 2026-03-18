"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KitchenMenuItem, KitchenOrder } from "@/lib/constant/kitchen-order"
import { MessageSquareIcon } from "lucide-react"
import Image from "next/image"

type Props = {
  order: KitchenOrder
  onClose: () => void
  onComplete: () => void
}

function MenuItemCard({ item }: { item: KitchenMenuItem }) {
  return (
    <div className="flex flex-col gap-2 border border-foreground/10 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <p className="font-semibold text-sm">{item.name}</p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground shrink-0">{item.qty}x</span>
      </div>
      <div className="flex items-center gap-2 border border-foreground/15 rounded-lg px-3 py-2">
        <MessageSquareIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          {item.note || "Tidak ada note untuk menu ini"}
        </span>
      </div>
    </div>
  )
}

export function OrderDetailModal({ order, onClose, onComplete }: Props) {
  const makanan = order.items.filter((i) => i.category === "makanan")
  const minuman = order.items.filter((i) => i.category === "minuman")

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
                {order.tableCode}
              </div>
              <div>
                <p className="font-semibold text-sm">{order.tableName}</p>
                <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{order.date}</p>
              <p>{order.time}</p>
            </div>
          </div>
        </div>

        <hr className="border-foreground/10" />

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Makanan */}
          {makanan.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-sm">Makanan</p>
              {makanan.map((item, i) => (
                <MenuItemCard key={i} item={item} />
              ))}
            </div>
          )}

          {/* Minuman */}
          {minuman.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-sm">Minuman</p>
              {minuman.map((item, i) => (
                <MenuItemCard key={i} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button onClick={onComplete} className="bg-secondary text-white hover:bg-secondary/90">
            Selesaikan Pesanan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}