"use client"

import { countOrderItems } from "@/lib/order"
import { getOrderPlace } from "@/lib/order-place"
import { getOrderStatusDisplay } from "@/lib/order-status"
import { TONE_OUTLINE_CLASS, TONE_SOLID_CLASS } from "@/lib/status-tone"
import { dashboardService } from "@/services/dashboard.service"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

function ActiveOrderRow({ order }: { order: Order }) {
  const place = getOrderPlace(order)
  const statusDisplay = getOrderStatusDisplay(order.status)

  return (
    <div className="flex items-center gap-3">
      <div className={`${TONE_SOLID_CLASS[statusDisplay.tone]} text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center`}>
        {place.code}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{place.name}</p>
        <p className="text-xs text-muted-foreground">{countOrderItems(order)} items</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${TONE_OUTLINE_CLASS[statusDisplay.tone]}`}>
          {statusDisplay.icon}
          {statusDisplay.label}
        </span>
        <div className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${TONE_SOLID_CLASS[statusDisplay.tone]}`} />
          <span className="text-xs text-muted-foreground">{statusDisplay.description}</span>
        </div>
      </div>
    </div>
  )
}

export function ActiveOrderList({ refreshKey }: { refreshKey: number }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchActiveOrders = useCallback(async () => {
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
    fetchActiveOrders()
  }, [fetchActiveOrders, refreshKey])

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
            <ActiveOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
