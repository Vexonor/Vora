"use client"

import { AddTableModal } from "@/components/[role]/manager/table-management/add-table-modal"
import { DeleteTableModal } from "@/components/[role]/manager/table-management/delete-table-modal"
import { TableCard } from "@/components/[role]/manager/table-management/table-card"
import { useSidebar } from "@/components/ui/sidebar"
import { tableService } from "@/services/table.service"
import type { Table } from "@/types/table"
import { CirclePlusIcon, Loader2Icon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

export default function TableManagementPage() {
  const { open } = useSidebar()
  const [tables, setTables] = useState<Table[]>([])
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTables = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tableService.getAll()
      setTables(Array.isArray(data) ? data : [])
    } catch {
      setError("Gagal memuat data meja.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const filtered = tables.filter((t) =>
    t.number.toString().includes(search)
  )

  const handleGenerate = async (num: number): Promise<string | null> => {
    const exists = tables.some((t) => t.number === num)
    if (exists) return `Meja nomor ${num} sudah ada.`

    try {
      const newTable = await tableService.create({ number: num })
      setTables((prev) =>
        [...prev, newTable].sort((a, b) => a.number - b.number)
      )
      return null
    } catch {
      return "Gagal menambahkan meja. Silakan coba lagi."
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await tableService.remove(deleteTarget.id)
      setTables((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    } catch {
      // Silent fail for now
    }
    setDeleteTarget(null)
  }

  const gridCols = open
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari meja ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={fetchTables} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-3 transition-all duration-200`}>

          {!search && (
            <div
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/20 hover:border-primary transition-colors cursor-pointer min-h-[180px]"
            >
              <CirclePlusIcon className="size-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tambah meja</span>
            </div>
          )}

          {filtered.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTableModal
          onGenerate={handleGenerate}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteTableModal
          tableCode={`T-${String(deleteTarget.number).padStart(2, "0")}`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}