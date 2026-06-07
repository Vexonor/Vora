"use client"

import { MenuTable } from "@/components/[role]/manager/menu/menu-table"
import { MenuFilterDropdown } from "@/components/shared/menu/menu-filter-dropdown"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { CirclePlusIcon, Loader2Icon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

const PAGE_SIZE = 20

export default function ManagerMenuPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchMenus = useCallback(async (q: string, statuses: number[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await menuService.getAll({
        q: q || undefined,
        statuses: statuses.length > 0 ? statuses : undefined,
      })
      setMenus(data)
    } catch {
      setError("Gagal memuat data menu.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus("", [])
  }, [fetchMenus])

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchMenus(val, statusFilter)
    }, 400)
  }

  const handleFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    setCurrentPage(1)
    fetchMenus(search, statuses)
  }

  const totalPages = Math.max(1, Math.ceil(menus.length / PAGE_SIZE))

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/manager/menu/create")}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <CirclePlusIcon className="size-4" />
          Tambah Menu
        </button>

        <div className="flex items-center gap-2">
          <MenuFilterDropdown selected={statusFilter} onApply={handleFilterApply} />
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari menu ..."
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
          <button onClick={() => fetchMenus(search, statusFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <MenuTable
          menus={menus}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          onDeleted={() => fetchMenus(search, statusFilter)}
        />
      )}

    </div>
  )
}
