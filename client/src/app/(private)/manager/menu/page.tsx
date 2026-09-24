"use client"

import { MenuTable } from "@/components/[role]/manager/menu/menu-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { MENU_STATUS_OPTIONS } from "@/lib/menu-status"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { CirclePlusIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 20

export default function ManagerMenuListPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchMenus = useCallback(async (searchTerm: string, statuses: number[]) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const data = await menuService.getAll({
        q: searchTerm || undefined,
        statuses: statuses.length > 0 ? statuses : undefined,
      })
      if (isLatest()) setMenus(data)
    } catch {
      if (isLatest()) setError("Gagal memuat data menu.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchMenus(debouncedSearch, statusFilter)
  }, [fetchMenus, debouncedSearch, statusFilter])

  const reloadMenus = () => fetchMenus(debouncedSearch, statusFilter)

  const handleDelete = async (menu: Menu) => {
    await menuService.remove(menu.id)
    reloadMenus()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(menus.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, totalPages)

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

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadMenus} />
      ) : (
        <MenuTable
          menus={menus}
          currentPage={visiblePage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
