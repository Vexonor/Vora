"use client"

import { UnitFormDialog } from "@/components/manager/unit/unit-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useDeleteUnit, useUnitList } from "@/hooks/queries/use-units"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView, paginate } from "@/lib/pagination"
import type { Unit } from "@/types/unit"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type UnitDialogState = { isOpen: false } | { isOpen: true; unitToEdit: Unit | null }

export default function ManagerUnitPage() {
  const [search, setSearch] = useState("")
  const [unitDialog, setUnitDialog] = useState<UnitDialogState>({ isOpen: false })
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const pagination = usePaginationState()
  const unitListQuery = useUnitList()
  const deleteUnit = useDeleteUnit()

  const normalizedSearch = search.trim().toLowerCase()
  const visibleUnits = (unitListQuery.data ?? []).filter((unit) =>
    (unit.name ?? "").toLowerCase().includes(normalizedSearch) ||
    (unit.abbreviation ?? "").toLowerCase().includes(normalizedSearch)
  )
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, visibleUnits.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleConfirmDelete = () => {
    if (!unitToDelete) return
    deleteUnit.mutate(unitToDelete.id, {
      onSuccess: () => {
        toast.success("Satuan berhasil dihapus.")
        setUnitToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus satuan. Pastikan tidak ada stok yang menggunakan satuan ini."),
    })
  }

  const columns: DataTableColumn<Unit>[] = [
    { header: "Nama Satuan", cellClassName: "font-medium", render: (unit) => unit.name },
    { header: "Singkatan", cellClassName: "text-muted-foreground", render: (unit) => unit.abbreviation },
    {
      header: "Aksi",
      align: "center",
      headerClassName: "w-32",
      render: (unit) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setUnitDialog({ isOpen: true, unitToEdit: unit })}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Edit Satuan"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            onClick={() => setUnitToDelete(unit)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Hapus Satuan"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setUnitDialog({ isOpen: true, unitToEdit: null })}
          className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Satuan
        </button>
        <SearchField value={search} onChange={handleSearchChange} placeholder="Cari satuan ..." />
      </div>

      {unitListQuery.isPending ? (
        <PageLoader />
      ) : unitListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data satuan." onRetry={() => unitListQuery.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginate(visibleUnits, currentPage, pagination.pageSize)}
          getRowKey={(unit) => unit.id}
          emptyMessage="Belum ada satuan yang ditambahkan atau ditemukan."
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {unitDialog.isOpen && (
        <UnitFormDialog unitToEdit={unitDialog.unitToEdit} onClose={() => setUnitDialog({ isOpen: false })} />
      )}

      {unitToDelete && (
        <ConfirmDeleteDialog
          title="Hapus satuan ini?"
          description={
            <>
              Satuan <span className="font-semibold text-foreground">{unitToDelete.name}</span> akan dihapus.
              Satuan yang masih dipakai stok tidak dapat dihapus.
            </>
          }
          isDeleting={deleteUnit.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setUnitToDelete(null)}
        />
      )}
    </div>
  )
}
