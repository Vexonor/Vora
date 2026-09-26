"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { StockTable } from "@/components/shared/stock/stock-table"
import { useStockList } from "@/hooks/queries/use-stocks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView } from "@/lib/pagination"
import { STOCK_STATUS_OPTIONS } from "@/lib/stock-status"
import { BoxIcon } from "@/components/icons/box"
import Link from "next/link"
import { useState } from "react"

export function StockListView({ basePath }: { basePath: string }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const stockListQuery = useStockList({
    search: debouncedSearch,
    statuses: statusFilter,
    page: pagination.requestedPage,
    pageSize: pagination.pageSize,
  })
  const stocks = stockListQuery.data?.stocks ?? []
  const { currentPage, totalPages } = getPaginationView(
    pagination.requestedPage,
    pagination.pageSize,
    stockListQuery.data?.count ?? 0,
  )

  if (stockListQuery.data && pagination.requestedPage > totalPages) {
    pagination.setRequestedPage(totalPages)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    pagination.resetToFirstPage()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${basePath}/create`}
          className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
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

      {stockListQuery.isPending ? (
        <PageLoader />
      ) : stockListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data bahan." onRetry={() => stockListQuery.refetch()} />
      ) : (
        <StockTable
          stocks={stocks}
          basePath={basePath}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
          isRefreshing={stockListQuery.isPlaceholderData}
        />
      )}
    </div>
  )
}
