"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { StockTable } from "@/components/shared/stock/stock-table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { STOCK_STATUS_OPTIONS } from "@/lib/stock-status"
import { stockService } from "@/services/stock.service"
import type { Stock } from "@/types/stock"
import { BoxIcon } from "@icons/box"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 20

function buildStockQuery(searchTerm: string, page: number, statuses: number[]) {
  const query: Record<string, string> = {
    page: String(page),
    limit: String(PAGE_SIZE),
    order_by: "created_at",
    direction: "DESC",
  }
  if (searchTerm.trim()) query.q = searchTerm.trim()
  if (statuses.length === 1) query.status = String(statuses[0])
  else if (statuses.length > 1) query.status = JSON.stringify(statuses)
  return query
}

export function StockListView({ basePath }: { basePath: string }) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchStocks = useCallback(async (searchTerm: string, page: number, statuses: number[]) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const data = await stockService.getAll(buildStockQuery(searchTerm, page, statuses))
      if (!isLatest()) return
      setStocks(data.stocks ?? [])
      setTotalPages(Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE)))
    } catch {
      if (isLatest()) setError("Gagal memuat data bahan.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchStocks(debouncedSearch, currentPage, statusFilter)
  }, [fetchStocks, debouncedSearch, currentPage, statusFilter])

  const reloadStocks = () => fetchStocks(debouncedSearch, currentPage, statusFilter)

  const handleDelete = async (stock: Stock) => {
    await stockService.remove(stock.id)
    const wasLastItemOnPage = stocks.length === 1 && currentPage > 1
    if (wasLastItemOnPage) setCurrentPage(currentPage - 1)
    else reloadStocks()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${basePath}/create`}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <BoxIcon className="size-4" />
          Tambah Bahan
        </Link>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status"
            options={STOCK_STATUS_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari bahan ..." />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadStocks} />
      ) : (
        <StockTable
          stocks={stocks}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          basePath={basePath}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
