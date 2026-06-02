"use client"

import { StockFilterDropdown } from "@/components/shared/stock/stock-filter-dropdown"
import { StockTable } from "@/components/shared/stock/stock-table"
import { stockService } from "@/services/stock.service"
import type { Stock } from "@/types/stock"
import { BoxIcon } from "@icons/box"
import { Loader2Icon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

const PAGE_SIZE = 5

export default function StockPage() {
  const router = useRouter()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchStocks = useCallback(async (q: string, page: number, statuses: number[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      }
      if (q.trim()) params.q = q.trim()
      if (statuses.length === 1) params.status = String(statuses[0])
      else if (statuses.length > 1) params.status = JSON.stringify(statuses)
      const data = await stockService.getAll(params)
      setStocks(data.stocks ?? [])
      setTotalPages(Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE)))
    } catch {
      setError("Gagal memuat data stok.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (stock: Stock) => {
    await stockService.remove(stock.id)
    fetchStocks(search, currentPage, statusFilter)
  }

  useEffect(() => {
    fetchStocks(search, currentPage, statusFilter)
  }, [fetchStocks])

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchStocks(val, 1, statusFilter), 400)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchStocks(search, page, statusFilter)
  }

  const handleFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    setCurrentPage(1)
    fetchStocks(search, 1, statuses)
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
          <StockFilterDropdown selected={statusFilter} onApply={handleFilterApply} />
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari bahan ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
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
          <button onClick={() => fetchStocks(search, currentPage, statusFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <StockTable
          stocks={stocks}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          basePath="/manager/stock"
          onDelete={handleDelete}
        />
      )}

    </div>
  )
}
