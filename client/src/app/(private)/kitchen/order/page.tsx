"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import type { OrderStatusTab } from "@/components/shared/order/order-page"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { getApiErrorMessage } from "@/lib/api-error"
import { getOrderPlace } from "@/lib/order-place"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-status"
import { orderService } from "@/services/order.service"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { KitchenOrderCard } from "./components/kitchen-order-card"

const POLL_INTERVAL_MS = 10_000

const KITCHEN_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
]

function matchesSearch(order: Order, normalizedSearch: string) {
  if (!normalizedSearch) return true
  const place = getOrderPlace(order)
  return [place.code, place.name, order.customer_name ?? "", `#${order.id}`]
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch)
}

export default function KitchenOrderPage() {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const { open: isSidebarOpen } = useSidebar()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startRequest = useLatestRequest()

  const fetchOrders = useCallback(async ({ isBackgroundRefresh = false } = {}) => {
    const isLatest = startRequest()
    if (!isBackgroundRefresh) {
      setIsLoading(true)
      setError(null)
    }
    try {
      const data = await orderService.getAll()
      if (isLatest()) setOrders(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest() && !isBackgroundRefresh) setError("Gagal memuat data pesanan.")
    } finally {
      if (isLatest() && !isBackgroundRefresh) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchOrders({ isBackgroundRefresh: true })
    }
    const pollTimer = setInterval(refreshWhenVisible, POLL_INTERVAL_MS)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      clearInterval(pollTimer)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId: number, nextStatus: number) => {
    try {
      await orderService.updateStatus(orderId, { status: nextStatus })
      fetchOrders({ isBackgroundRefresh: true })
    } catch {
      toast.error("Gagal memperbarui status pesanan. Coba lagi.")
    }
  }

  const handleCancelOrder = async (orderId: number, reason: string) => {
    try {
      await orderService.cancel(orderId, { reason })
      toast.success("Pesanan berhasil dibatalkan.")
      fetchOrders({ isBackgroundRefresh: true })
      return true
    } catch (cancelError) {
      toast.error(getApiErrorMessage(cancelError, "Gagal membatalkan pesanan. Coba lagi."))
      return false
    }
  }

  const handleTabChange = (tabStatus: OrderStatus | null) => {
    setActiveTabStatus(tabStatus)
    setStatusFilter([])
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveTabStatus(null)
  }

  const normalizedSearch = search.trim().toLowerCase()
  const visibleOrders = orders.filter((order) => {
    const matchesTab = activeTabStatus === null || order.status === activeTabStatus
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(order.status)
    return matchesTab && matchesStatusFilter && matchesSearch(order, normalizedSearch)
  })

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-1 md:grid-cols-1 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {KITCHEN_STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.status)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                ${activeTabStatus === tab.status && statusFilter.length === 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-foreground/30 hover:border-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status Pesanan"
            options={ORDER_STATUS_FILTER_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan ..." />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={() => fetchOrders()} />
      ) : visibleOrders.length > 0 ? (
        <div className={`grid ${gridColumnsClass} gap-4 transition-all duration-200`}>
          {visibleOrders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onCancel={handleCancelOrder}
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
