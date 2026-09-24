import { getOrderStatusDisplay } from "@/lib/order-status"
import { TONE_OUTLINE_CLASS, TONE_SOLID_CLASS } from "@/lib/status-tone"

export function OrderStatusIndicator({ status }: { status: number }) {
  const display = getOrderStatusDisplay(Number(status))

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${TONE_OUTLINE_CLASS[display.tone]}`}>
        {display.icon}
        {display.label}
      </span>
      <div className="flex items-center gap-1">
        <span className={`size-1.5 rounded-full ${TONE_SOLID_CLASS[display.tone]}`} />
        <span className="text-xs text-muted-foreground">{display.description}</span>
      </div>
    </div>
  )
}
