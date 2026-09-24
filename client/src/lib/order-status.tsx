import type { StatusTone } from "@/lib/status-tone"
import { OrderStatus } from "@/types/order"
import { CheckCheckIcon, CircleAlertIcon, CircleCheckIcon, ClockIcon, TimerIcon, XCircleIcon } from "lucide-react"

type OrderStatusDisplay = {
  label: string
  description: string
  tone: StatusTone
  icon: React.ReactNode
}

const ORDER_STATUS_DISPLAY: Record<OrderStatus, OrderStatusDisplay> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    description: "Menunggu diproses",
    tone: "secondary",
    icon: <ClockIcon className="size-3.5" />,
  },
  [OrderStatus.PROCESSING]: {
    label: "Diproses",
    description: "Sedang diproses",
    tone: "secondary",
    icon: <TimerIcon className="size-3.5" />,
  },
  [OrderStatus.READY]: {
    label: "Siap",
    description: "Siap disajikan",
    tone: "primary",
    icon: <CheckCheckIcon className="size-3.5" />,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    description: "Pesanan selesai",
    tone: "primary",
    icon: <CircleCheckIcon className="size-3.5" />,
  },
  [OrderStatus.CANCELED]: {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan",
    tone: "destructive",
    icon: <XCircleIcon className="size-3.5" />,
  },
}

const UNKNOWN_ORDER_STATUS: OrderStatusDisplay = {
  label: "Unknown",
  description: "",
  tone: "neutral",
  icon: <CircleAlertIcon className="size-3.5" />,
}

export function getOrderStatusDisplay(status: number) {
  return ORDER_STATUS_DISPLAY[status as OrderStatus] ?? UNKNOWN_ORDER_STATUS
}

type KitchenNextAction = {
  label: string
  nextStatus: OrderStatus
  requiresConfirmation: boolean
}

const KITCHEN_NEXT_ACTIONS: Partial<Record<OrderStatus, KitchenNextAction>> = {
  [OrderStatus.PENDING]: { label: "Proses Pesanan", nextStatus: OrderStatus.PROCESSING, requiresConfirmation: false },
  [OrderStatus.PROCESSING]: { label: "Tandai Siap", nextStatus: OrderStatus.READY, requiresConfirmation: false },
  [OrderStatus.READY]: { label: "Selesaikan Pesanan", nextStatus: OrderStatus.COMPLETED, requiresConfirmation: true },
}

export function getKitchenNextAction(status: number) {
  return KITCHEN_NEXT_ACTIONS[status as OrderStatus] ?? null
}

export function canKitchenCancelOrder(status: number) {
  return status === OrderStatus.PENDING || status === OrderStatus.PROCESSING
}

export const ORDER_STATUS_FILTER_OPTIONS =Object.entries(ORDER_STATUS_DISPLAY).map(([value, display]) => ({
  value: Number(value),
  label: display.label,
  tone: display.tone,
}))
