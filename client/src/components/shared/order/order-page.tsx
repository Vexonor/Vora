"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-status"
import { orderService } from "@/services/order.service"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { useCallback, useEffect, useState } from "react"
import { OrderCard } from "./order-card"

export type OrderStatusTab = {
  label: string
  status: OrderStatus | null
}

const DEFAULT_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
]

type Props = {
  statusTabs?: OrderStatusTab[]
}

export function OrderPage({ statusTabs = DEFAULT_STATUS_TABS }: Props) {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const { open: isSidebarOpen } = useSidebar()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startRequest = useLatestRequest()

  const fetchOrders = useCallback(async (tabStatus: OrderStatus | null, searchTerm: string, statuses: number[]) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const data = await orderService.getAll({
        ...(statuses.length > 0
          ? { statuses }
          : tabStatus !== null
            ? { status: tabStatus }
            : {}),
        ...(searchTerm && { search: searchTerm }),
      })
      if (isLatest()) setOrders(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest()) setError("Gagal memuat data pesanan.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchOrders(activeTabStatus, debouncedSearch, statusFilter)
  }, [fetchOrders, activeTabStatus, debouncedSearch, statusFilter])

  const reloadOrders = () => fetchOrders(activeTabStatus, debouncedSearch, statusFilter)

  const handleTabChange = (tabStatus: OrderStatus | null) => {
    setActiveTabStatus(tabStatus)
    setStatusFilter([])
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveTabStatus(null)
  }

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 lg:flex-2 order-2 lg:order-1 items-center gap-2">
          {statusTabs.map((tab) => (
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

        <div className="flex flex-1 lg:order-2 order-1 items-center gap-2">
          <FilterDropdown
            title="Status Pesanan"
            options={ORDER_STATUS_FILTER_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan ..." className="flex-1" />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadOrders} />
      ) : orders.length > 0 ? (
        <div className={`grid ${gridColumnsClass} gap-4 transition-all duration-200`}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onPaymentVerified={reloadOrders} />
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
