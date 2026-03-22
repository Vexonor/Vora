"use client"

import { StockTable } from "@/components/shared/stock/stock-table"
import { STOCKS } from "@/lib/constant/stock"
import { BoxIcon } from "@icons/box"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PAGE_SIZE = 5

export default function StockPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = STOCKS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/manager/stock/create")}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <BoxIcon className="size-4" />
          Tambah Bahan
        </button>

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
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <StockTable
        stocks={filtered}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />

    </div>
  )
}