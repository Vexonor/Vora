"use client"

import { AddTableModal } from "@/components/[role]/manager/table-management/add-table-modal"
import { TableCard } from "@/components/[role]/manager/table-management/table-card"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { formatTableCode } from "@/lib/order-place"
import { tableService } from "@/services/table.service"
import type { Table } from "@/types/table"
import { CirclePlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagerTableManagementPage() {
  const { open: isSidebarOpen } = useSidebar()
  const [tables, setTables] = useState<Table[]>([])
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTables = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tableService.getAll({ order_by: "created_at", direction: "DESC" })
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

  const visibleTables = tables.filter((table) => table.number.toString().includes(search.trim()))

  const handleCreateTable = async (tableNumber: number): Promise<string | null> => {
    if (tables.some((table) => table.number === tableNumber)) return `Meja nomor ${tableNumber} sudah ada.`

    try {
      const createdTable = await tableService.create({ number: tableNumber })
      setTables((previous) => [...previous, createdTable].sort((a, b) => a.number - b.number))
      return null
    } catch {
      return "Gagal menambahkan meja. Silakan coba lagi."
    }
  }

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return
    setIsDeleting(true)
    try {
      await tableService.remove(tableToDelete.id)
      setTables((previous) => previous.filter((table) => table.id !== tableToDelete.id))
      toast.success("Meja berhasil dihapus.")
      setTableToDelete(null)
    } catch {
      toast.error("Gagal menghapus meja. Coba lagi.")
    } finally {
      setIsDeleting(false)
    }
  }

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-end gap-2">
        <SearchField value={search} onChange={setSearch} placeholder="Cari meja ..." />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={fetchTables} />
      ) : (
        <div className={`grid ${gridColumnsClass} gap-3 transition-all duration-200`}>
          {!search && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/20 hover:border-primary transition-colors cursor-pointer min-h-[180px]"
            >
              <CirclePlusIcon className="size-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tambah meja</span>
            </button>
          )}

          {visibleTables.map((table) => (
            <TableCard key={table.id} table={table} onDelete={setTableToDelete} />
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddTableModal onCreateTable={handleCreateTable} onClose={() => setIsAddModalOpen(false)} />
      )}

      {tableToDelete && (
        <ConfirmDeleteDialog
          title="Hapus meja ini?"
          description={
            <>
              Meja <span className="font-semibold text-foreground">{formatTableCode(tableToDelete.number)}</span> akan
              dihapus beserta QR code-nya. Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setTableToDelete(null)}
        />
      )}
    </div>
  )
}
