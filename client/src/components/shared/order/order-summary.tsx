import { formatDate, formatNumber, formatTime } from "@/lib/format"
import { countOrderItems, getOrderItemName } from "@/lib/order"
import { getOrderPlace } from "@/lib/order-place"
import { cn } from "@/lib/utils"
import type { Order } from "@/types/order"
import { OrderStatusIndicator } from "./order-status-indicator"

export function OrderPlaceTile({ code, className }: { code: string; className?: string }) {
  return (
    <div className={cn("bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center", className)}>
      {code}
    </div>
  )
}

export function OrderSummary({ order }: { order: Order }) {
  const place = getOrderPlace(order)

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <OrderPlaceTile code={place.code} />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{place.name}</p>
              {place.isTakeAway && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/30">
                  Take Away
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{countOrderItems(order)} items</p>
          </div>
        </div>
        <OrderStatusIndicator status={order.status} />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(order.created_at, "weekday", "")}</span>
        <span>{formatTime(order.created_at, {}, "")}</span>
      </div>

      <hr className="border-foreground/10" />

      <div className="flex flex-1 flex-col gap-1 min-h-0">
        <div className="grid grid-cols-3 text-xs text-muted-foreground">
          <span>Menu</span>
          <span className="text-center">Jumlah</span>
          <span className="text-right">Harga</span>
        </div>
        <div className="flex flex-col gap-1 h-24 overflow-y-auto pr-1">
          {order.items?.map((item) => (
            <div key={item.id} className="grid grid-cols-3 text-sm">
              <span>{getOrderItemName(item)}</span>
              <span className="text-center">{item.quantity}</span>
              <span className="text-right">{formatNumber(item.total_price)}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-foreground/10" />

      <div className="flex justify-between font-bold text-base mt-1">
        <span>Total</span>
        <span>{formatNumber(order.total_price)}</span>
      </div>
    </>
  )
}
