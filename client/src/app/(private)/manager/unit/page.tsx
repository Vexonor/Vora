"use client"

import { UnitFormDialog } from "@/components/[role]/manager/unit/unit-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { SearchField } from "@/components/shared/search-field"
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

type UnitDialogState = { isOpen: false } | { isOpen: true; unitToEdit: Unit | null }

export default function ManagerUnitPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [unitDialog, setUnitDialog] = useState<UnitDialogState>({ isOpen: false })
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUnits = useCallback(async () => {
    try {
      const data = await unitService.getAll({ order_by: "created_at", direction: "DESC" })
      setUnits(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Gagal memuat data satuan.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const normalizedSearch = search.trim().toLowerCase()
  const visibleUnits = units.filter((unit) =>
    (unit.name ?? "").toLowerCase().includes(normalizedSearch) ||
    (unit.abbreviation ?? "").toLowerCase().includes(normalizedSearch)
  )

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return
    setIsDeleting(true)
    try {
      await unitService.remove(unitToDelete.id)
      toast.success("Satuan berhasil dihapus.")
      setUnitToDelete(null)
      fetchUnits()
    } catch {
      toast.error("Gagal menghapus satuan. Pastikan tidak ada stok yang menggunakan satuan ini.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setUnitDialog({ isOpen: true, unitToEdit: null })}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Satuan
        </button>
        <SearchField value={search} onChange={setSearch} placeholder="Cari satuan ..." />
      </div>

      <div className="bg-white rounded-xl border border-foreground/10 overflow-x-auto flex-1">
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-left px-6 py-4 font-semibold w-20">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Nama Satuan</th>
              <th className="text-left px-6 py-4 font-semibold">Singkatan</th>
              <th className="text-center px-6 py-4 font-semibold w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : visibleUnits.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-20 text-muted-foreground">
                  Belum ada satuan yang ditambahkan atau ditemukan.
                </td>
              </tr>
            ) : (
              visibleUnits.map((unit, index) => (
                <tr key={unit.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{index + 1}.</td>
                  <td className="px-6 py-4 font-medium">{unit.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{unit.abbreviation}</td>
                  <td className="px-6 py-4 text-center">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {unitDialog.isOpen && (
        <UnitFormDialog
          unitToEdit={unitDialog.unitToEdit}
          onSaved={fetchUnits}
          onClose={() => setUnitDialog({ isOpen: false })}
        />
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
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setUnitToDelete(null)}
        />
      )}
    </div>
  )
}
