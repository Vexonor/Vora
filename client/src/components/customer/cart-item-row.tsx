"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart, type CartItem } from "@/hooks/use-cart"
import { formatRupiah } from "@/lib/format"
import { MENU_IMAGE_PLACEHOLDER } from "@/lib/menu-status"
import { cn } from "@/lib/utils"
import { MinusIcon } from "@icons/minus"
import { NoteIcon } from "@icons/note"
import { PlusIcon } from "@icons/plus"
import Image from "next/image"

export function CartItemRow({ item, className }: { item: CartItem; className?: string }) {
  const { setCartQuantity } = useCart()

  return (
    <div className={cn("flex flex-col gap-2 border rounded-lg p-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="shrink-0">
          <Image
            src={item.menu.image_url ?? MENU_IMAGE_PLACEHOLDER}
            alt={item.menu.name}
            width={100}
            height={100}
            className="size-16 object-cover rounded-xl"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{item.menu.name}</h4>
          <span className="text-xs text-muted-foreground">{formatRupiah(item.menu.price)}</span>
        </div>

        <div className="flex items-center gap-2 bg-background p-1 rounded-full">
          <Button
            variant="default"
            size="icon"
            className="size-6 bg-white rounded-full"
            onClick={() => setCartQuantity(item.menu.id, item.quantity - 1)}
            aria-label="Kurangi jumlah"
          >
            <MinusIcon className="size-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <Button
            variant="default"
            size="icon"
            className="size-6 bg-white rounded-full"
            onClick={() => setCartQuantity(item.menu.id, item.quantity + 1)}
            aria-label="Tambah jumlah"
          >
            <PlusIcon className="size-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-primary-foreground border-2 border-primary rounded-lg p-2">
        <NoteIcon className="size-5 text-foreground" />
        <Input className="text-xs font-medium" placeholder="Tambahkan note untuk pesanan ini" />
      </div>
    </div>
  )
}
