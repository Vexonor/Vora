"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useCart from "@/hooks/use-cart"
import { MinusIcon } from "@icons/minus"
import { NoteIcon } from "@icons/note"
import { PlusIcon } from "@icons/plus"
import Image from "next/image"

const OrderSection = () => {
  const {
    cartItems,
    updateQuantity,
  } = useCart()

  return (
    <div className="">
      <h3 className="text-base text-foreground font-bold pb-2">Pesanan Anda</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.menu.id} className="flex flex-col gap-2 bg-white border border-foreground/20 rounded-lg p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="shrink-0">
                <Image
                  src={item.menu.image}
                  alt={item.menu.name}
                  width={100}
                  height={100}
                  className="size-16 object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.menu.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(item.menu.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-background p-1 rounded-full">
                <Button
                  variant="default"
                  size="icon"
                  className="size-6 bg-white rounded-full"
                  onClick={() => updateQuantity(item.menu.id, item.quantity - 1)}
                >
                  <MinusIcon className="size-3" />
                </Button>

                <span className="text-sm font-medium w-6 text-center">
                  {item.quantity}
                </span>

                <Button
                  variant="default"
                  size="icon"
                  className="size-6 bg-white rounded-full"
                  onClick={() => updateQuantity(item.menu.id, item.quantity + 1)}
                >
                  <PlusIcon className="size-3" />
                </Button>
              </div>
            </div>
            {/* Note */}
            <div className="flex items-center gap-1 bg-primary-foreground border-2 border-primary rounded-lg p-2">
              <NoteIcon className="size-5 text-foreground" />
              <Input
                className="text-xs font-medium"
                placeholder="Tambahkan note untuk pesanan ini"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderSection