"use client"

import { AddTableModal } from "@/components/manager/table-management/add-table-modal"
import { TableCard } from "@/components/manager/table-management/table-card"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { formatTableCode } from "@/lib/order-place"
import { useCreateTable, useDeleteTable, useTableList } from "@/hooks/queries/use-tables"
import type { Table } from "@/types/table"
import { CirclePlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ManagerTableManagementPage() {
  const { open: isSidebarOpen } = useSidebar()
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const tableListQuery = useTableList()
  const createTable = useCreateTable()
  const deleteTable = useDeleteTable()
  const tables = tableListQuery.data ?? []

  const visibleTables = tables.filter((table) => table.number.toString().includes(search.trim()))

  const handleCreateTable = async (tableNumber: number): Promise<string | null> => {
    if (tables.some((table) => table.number === tableNumber)) return `Meja nomor ${tableNumber} sudah ada.`
    try {
      await createTable.mutateAsync(tableNumber)
      return null
    } catch {
      return "Gagal menambahkan meja. Silakan coba lagi."
    }
  }

  const handleConfirmDelete = () => {
    if (!tableToDelete) return
    deleteTable.mutate(tableToDelete.id, {
      onSuccess: () => {
        toast.success("Meja berhasil dihapus.")
        setTableToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus meja. Coba lagi."),
    })
  }

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-end gap-2">
        <SearchField value={search} onChange={setSearch} placeholder="Cari meja ..." />
      </div>

      {tableListQuery.isPending ? (
        <PageLoader />
      ) : tableListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data meja." onRetry={() => tableListQuery.refetch()} />
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
          isDeleting={deleteTable.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setTableToDelete(null)}
        />
      )}
    </div>
  )
}
