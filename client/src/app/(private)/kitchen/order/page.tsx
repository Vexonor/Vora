"use client"

import { OrderFilterDropdown } from "@/components/shared/order/order-filter-dropdown"
import { useSidebar } from "@/components/ui/sidebar"
import { orderService } from "@/services/order.service"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { Loader2Icon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { KitchenOrderCard } from "./components/kitchen-order-card"

const KITCHEN_FILTER_TABS = [
  { label: "Semua", value: "semua" },
  { label: "Menunggu", value: String(OrderStatus.PENDING) },
  { label: "Diproses", value: String(OrderStatus.PROCESSING) },
  { label: "Siap", value: String(OrderStatus.READY) },
  { label: "Selesai", value: String(OrderStatus.COMPLETED) },
] as const

export default function KitchenOrderPage() {
  const [activeFilter, setActiveFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const { open } = useSidebar()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const POLL_INTERVAL = 10_000

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
      setError(null)
    }
    try {
      const data = await orderService.getAll()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      if (!silent) setError("Gagal memuat data pesanan.")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") fetchOrders(true)
    }
    const timer = setInterval(tick, POLL_INTERVAL)
    document.addEventListener("visibilitychange", tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId: number, newStatus: number) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus })
      fetchOrders(true)
    } catch {
      // Silent fail
    }
  }

  const handleCancel = async (orderId: number, reason: string) => {
    await orderService.cancel(orderId, { reason })
    fetchOrders(true)
  }

  const handleTabChange = (val: string) => {
    setActiveFilter(val)
    setStatusFilter([])
  }

  const handleFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveFilter("semua")
  }

  const filtered = orders.filter((o) => {
    const matchTab = activeFilter === "semua" || o.status === Number(activeFilter)
    const matchDropdown = statusFilter.length === 0 || statusFilter.includes(o.status)
    const tableCode = `T-${String(o.table_id).padStart(2, "0")}`
    const tableName = `Meja ${String(o.table_id).padStart(2, "0")}`
    const matchSearch =
      tableName.toLowerCase().includes(search.toLowerCase()) ||
      tableCode.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchDropdown && matchSearch
  })

  const gridCols = open
    ? "grid-cols-1 md:grid-cols-1 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {KITCHEN_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                ${activeFilter === tab.value && statusFilter.length === 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-foreground/30 hover:border-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <OrderFilterDropdown selected={statusFilter} onApply={handleFilterApply} />
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari pesanan ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => fetchOrders()} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <div className={`grid ${gridCols} gap-4 transition-all duration-200`}>
          {filtered.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Tidak ada pesanan ditemukan.
        </div>
      )}

    </div>
  )
}
