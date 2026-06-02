"use client"

import { TransactionCard } from "@/components/shared/order/order-card"
import { OrderFilterDropdown } from "@/components/shared/order/order-filter-dropdown"
import { useSidebar } from "@/components/ui/sidebar"
import { orderService } from "@/services/order.service"
import type { Order } from "@/types/order"
import { OrderStatus } from "@/types/order"
import { Loader2Icon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const DEFAULT_FILTER_TABS = [
  { label: "Semua", value: "semua" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Diproses", value: "diproses" },
  { label: "Siap", value: "siap" },
  { label: "Selesai", value: "selesai" },
] as const

const FILTER_STATUS: Record<string, number | undefined> = {
  semua: undefined,
  menunggu: OrderStatus.PENDING,
  diproses: OrderStatus.PROCESSING,
  siap: OrderStatus.READY,
  selesai: OrderStatus.COMPLETED,
  dibatalkan: OrderStatus.CANCELED,
}

type FilterTab = {
  label: string
  value: string
}

type Props = {
  filterTabs?: readonly FilterTab[]
}

export function OrderPage({ filterTabs = DEFAULT_FILTER_TABS }: Props) {
  const [activeFilter, setActiveFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { open } = useSidebar()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchOrders = useCallback(async (filter: string, searchTerm: string, statuses: number[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const status = FILTER_STATUS[filter]
      const data = await orderService.getAll({
        ...(statuses.length > 0
          ? { statuses }
          : status !== undefined
            ? { status }
            : {}),
        ...(searchTerm && { search: searchTerm }),
      })
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError("Gagal memuat data pesanan.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(activeFilter, debouncedSearch, statusFilter)
  }, [activeFilter, debouncedSearch, fetchOrders])

  const handleTabChange = (val: string) => {
    setActiveFilter(val)
    setStatusFilter([])
    fetchOrders(val, debouncedSearch, [])
  }

  const handleFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveFilter("semua")
    fetchOrders(statuses.length > 0 ? "semua" : activeFilter, debouncedSearch, statuses)
  }

  const gridCols = open
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 lg:flex-2 order-2 lg:order-1 items-center gap-2">
          {filterTabs.map((tab) => (
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

        <div className="flex flex-1 lg:order-2 order-1 items-center gap-2">
          <OrderFilterDropdown selected={statusFilter} onApply={handleFilterApply} />
          <div className="flex flex-1 items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
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
          <button onClick={() => fetchOrders(activeFilter, debouncedSearch, statusFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className={`grid ${gridCols} gap-4 transition-all duration-200`}>
          {orders.map((order) => (
            <TransactionCard key={order.id} order={order} onRefresh={() => fetchOrders(activeFilter, debouncedSearch, statusFilter)} />
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
