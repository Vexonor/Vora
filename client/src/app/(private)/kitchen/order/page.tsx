"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { KITCHEN_FILTER_TABS, KITCHEN_ORDERS } from "@/lib/constant/kitchen-order"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { KitchenOrderCard } from "./components/kitchen-order-card"

export default function KitchenOrderPage() {
  const [activeFilter, setActiveFilter] = useState("semua")
  const [search, setSearch] = useState("")
  const { open } = useSidebar()

  const filtered = KITCHEN_ORDERS.filter((o) => {
    const matchFilter = activeFilter === "semua" || o.status === activeFilter
    const matchSearch =
      o.tableName.toLowerCase().includes(search.toLowerCase()) ||
      o.tableCode.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
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
              onClick={() => setActiveFilter(tab.value)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                ${activeFilter === tab.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-foreground/30 hover:border-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="border border-foreground/30 rounded-lg p-2 hover:border-primary transition-colors">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          </button>
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

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className={`grid ${gridCols} gap-4 transition-all duration-200`}>
          {filtered.map((order) => (
            <KitchenOrderCard key={order.id} {...order} />
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