"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { OrderGrid } from "@/components/shared/order/order-grid"
import type { OrderStatusTab } from "@/components/shared/order/order-page"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { KITCHEN_ORDER_POLL_INTERVAL_MS, useOrderList } from "@/hooks/queries/use-orders"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { resolveOrderStatusFilter } from "@/lib/order-list-page"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-status"
import { OrderStatus } from "@/types/order"
import { useState } from "react"
import { KitchenOrderCard } from "./components/kitchen-order-card"

const KITCHEN_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
]

export default function KitchenOrderPage() {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const { open: isSidebarOpen } = useSidebar()

  const orderList = useOrderList(
    { statuses: resolveOrderStatusFilter(activeTabStatus, statusFilter), search: debouncedSearch },
    { pollIntervalMs: KITCHEN_ORDER_POLL_INTERVAL_MS },
  )

  const handleTabChange = (tabStatus: OrderStatus | null) => {
    setActiveTabStatus(tabStatus)
    setStatusFilter([])
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveTabStatus(null)
  }

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

      {orderList.isPending ? (
        <PageLoader />
      ) : orderList.isError ? (
        <LoadErrorState message="Gagal memuat data pesanan." onRetry={() => orderList.refetch()} />
      ) : orderList.orders.length > 0 ? (
        <OrderGrid
          orders={orderList.orders}
          gridColumnsClass={gridColumnsClass}
          renderOrder={(order) => <KitchenOrderCard order={order} />}
          hasNextPage={orderList.hasNextPage}
          isFetchingNextPage={orderList.isFetchingNextPage}
          hasNextPageError={orderList.isFetchNextPageError}
          onLoadNextPage={() => orderList.fetchNextPage()}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Tidak ada pesanan ditemukan.
        </div>
      )}
    </div>
  )
}
