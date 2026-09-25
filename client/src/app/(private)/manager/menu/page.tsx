"use client"

import { MenuTable } from "@/components/manager/menu/menu-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useMenuList } from "@/hooks/queries/use-menus"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { MENU_STATUS_OPTIONS } from "@/lib/menu-status"
import { getPaginationView, paginate } from "@/lib/pagination"
import { CirclePlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ManagerMenuListPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const menuListQuery = useMenuList({ search: debouncedSearch, statuses: statusFilter })
  const menus = menuListQuery.data ?? []
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, menus.length)

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
          href="/manager/menu/create"
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <CirclePlusIcon className="size-4" />
          Tambah Menu
        </Link>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status"
            options={MENU_STATUS_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari menu ..." />
        </div>
      </div>

      {menuListQuery.isPending ? (
        <PageLoader />
      ) : menuListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data menu." onRetry={() => menuListQuery.refetch()} />
      ) : (
        <MenuTable
          menus={paginate(menus, currentPage, pagination.pageSize)}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}
    </div>
  )
}
