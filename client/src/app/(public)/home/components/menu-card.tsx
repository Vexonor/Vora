import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/format"
import { MENU_IMAGE_PLACEHOLDER } from "@/lib/menu-status"
import type { Menu } from "@/types/menu"
import { MenuStatus } from "@/types/menu"
import { MinusIcon } from "@icons/minus"
import { PlusIcon } from "@icons/plus"
import Image from "next/image"

type QuantityStepperProps = {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

function QuantityStepper({ quantity, onIncrease, onDecrease }: QuantityStepperProps) {
  return (
    <div className="flex items-center bg-primary/10 rounded-full p-1 border border-primary/20 animate-in fade-in zoom-in duration-200">
      <button
        onClick={onDecrease}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-background text-foreground hover:bg-destructive hover:text-white transition-colors"
        aria-label="Kurangi jumlah"
      >
        <MinusIcon className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-primary tabular-nums">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        aria-label="Tambah jumlah"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}

type Props = {
  menu: Menu
  quantity: number
  onAdd: () => void
  onIncrease: () => void
  onDecrease: () => void
}

export function MenuCard({ menu, quantity, onAdd, onIncrease, onDecrease }: Props) {
  const isAvailable = menu.status === MenuStatus.AVAILABLE

  return (
    <div
      className={`group relative flex flex-row gap-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 p-4
        ${isAvailable ? "hover:shadow-md hover:-translate-y-1" : "opacity-60 grayscale cursor-not-allowed"}`}
    >
      <div className="relative w-1/3 aspect-square overflow-hidden bg-muted cursor-pointer rounded-lg shrink-0">
        <Image
          src={menu.image_url ?? MENU_IMAGE_PLACEHOLDER}
          alt={menu.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
        {!isAvailable && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="shadow-sm uppercase text-[10px] tracking-wider">
              Habis
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1 cursor-pointer">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {menu.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {menu.description || "Main Course"}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Harga</span>
            <span className="text-lg font-bold text-foreground">{formatRupiah(menu.price)}</span>
          </div>

          {!isAvailable ? (
            <Button disabled variant="outline" size="sm" className="h-10 opacity-50 shrink-0">
              Stok Habis
            </Button>
          ) : quantity === 0 ? (
            <Button
              onClick={onAdd}
              size="icon"
              className="h-10 w-10 rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shrink-0"
              aria-label={`Tambah ${menu.name} ke keranjang`}
            >
              <PlusIcon className="size-5" />
            </Button>
          ) : (
            <QuantityStepper quantity={quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
          )}
        </div>
      </div>
    </div>
  )
}
