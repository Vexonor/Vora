"use client"

import { dashboardService } from "@/services/dashboard.service"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { CheckCheckIcon, ClockIcon, Loader2Icon, TimerIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const STATUS_UI: Record<number, {
  label: string
  icon: React.ReactNode
  buttonClass: string
  dotClass: string
  description: string
  tableBg: string
}> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    icon: <ClockIcon className="size-3.5" />,
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    description: "Menunggu diproses",
    tableBg: "bg-secondary",
  },
  [OrderStatus.PROCESSING]: {
    label: "Proses",
    icon: <TimerIcon className="size-3.5" />,
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    description: "Sedang diproses",
    tableBg: "bg-secondary",
  },
  [OrderStatus.READY]: {
    label: "Siap",
    icon: <CheckCheckIcon className="size-3.5" />,
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
    description: "Siap disajikan",
    tableBg: "bg-primary",
  },
}

const DEFAULT_STATUS = {
  label: "Unknown",
  icon: <ClockIcon className="size-3.5" />,
  buttonClass: "border border-foreground/30 text-foreground",
  dotClass: "bg-foreground/30",
  description: "",
  tableBg: "bg-foreground/30",
}

function OrderItem({ order }: { order: Order }) {
  const config = STATUS_UI[Number(order.status)] ?? DEFAULT_STATUS
  const tableCode = `T-${String(order.table_id).padStart(2, "0")}`
  const tableName = `Meja ${String(order.table_id).padStart(2, "0")}`
  const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0

  return (
    <div className="flex items-center gap-3">
      <div className={`${config.tableBg} text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center`}>
        {tableCode}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{tableName}</p>
        <p className="text-xs text-muted-foreground">{itemCount} items</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${config.buttonClass}`}>
          {config.icon}
          {config.label}
        </button>
        <div className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${config.dotClass}`} />
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </div>
      </div>
    </div>
  )
}

type Props = {
  refreshKey?: number
}

export function OrderList({ refreshKey }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await dashboardService.getActiveOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders, refreshKey])

  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pesanan Aktif</h4>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pesanan aktif.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
