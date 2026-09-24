"use client"

import { StockFilterDropdown } from "@/components/shared/stock/stock-filter-dropdown"
import { StockTable } from "@/components/shared/stock/stock-table"
import { stockService } from "@/services/stock.service"
import type { Stock } from "@/types/stock"
import { BoxIcon } from "@icons/box"
import { Loader2Icon, SearchIcon } from "lucide-react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 20

export default function StockPage() {
  const router = useRouter()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchStocks = useCallback(async (q: string, page: number, statuses: number[]) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
        order_by: "created_at",
        direction: "DESC",
      }
      if (q.trim()) params.q = q.trim()
      if (statuses.length === 1) params.status = String(statuses[0])
      else if (statuses.length > 1) params.status = JSON.stringify(statuses)
      const data = await stockService.getAll(params)
      if (!isLatest()) return
      setStocks(data.stocks ?? [])
      setTotalPages(Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE)))
    } catch {
      if (isLatest()) setError("Gagal memuat data stok.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchStocks(debouncedSearch, currentPage, statusFilter)
  }, [fetchStocks, debouncedSearch, currentPage, statusFilter])

  const handleDelete = async (stock: Stock) => {
    await stockService.remove(stock.id)
    const isLastItemOnPage = stocks.length === 1 && currentPage > 1
    if (isLastItemOnPage) {
      setCurrentPage(currentPage - 1)
    } else {
      fetchStocks(debouncedSearch, currentPage, statusFilter)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
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
          <button onClick={() => fetchStocks(debouncedSearch, currentPage, statusFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <StockTable
          stocks={stocks}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          basePath="/manager/stock"
          onDelete={handleDelete}
        />
      )}

    </div>
  )
}
