"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { PencilIcon, PlusIcon, Trash2Icon, Loader2Icon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagerUnitPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  
  // Form states
  const [unitName, setUnitName] = useState("")
  const [unitAbbreviation, setUnitAbbreviation] = useState("")

  const fetchUnits = async () => {
    setIsLoading(true)
    try {
      const data = await unitService.getAll({ order_by: "created_at", direction: "DESC" })
      setUnits(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch units:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  const filtered = units.filter((u) => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.abbreviation || "").toLowerCase().includes(search.toLowerCase())
  )

  const openAddModal = () => {
    setModalMode("add")
    setSelectedUnit(null)
    setUnitName("")
    setUnitAbbreviation("")
    setIsModalOpen(true)
  }

  const openEditModal = (unit: Unit) => {
    setModalMode("edit")
    setSelectedUnit(unit)
    setUnitName(unit.name || "")
    setUnitAbbreviation(unit.abbreviation || "")
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!unitName.trim() || !unitAbbreviation.trim()) return

    setIsSubmitting(true)
    try {
      if (modalMode === "add") {
        await unitService.create({ name: unitName, abbreviation: unitAbbreviation })
      } else if (modalMode === "edit" && selectedUnit) {
        await unitService.update(selectedUnit.id, { name: unitName, abbreviation: unitAbbreviation })
      }
      setIsModalOpen(false)
      fetchUnits() // Refresh table
    } catch (err) {
      console.error("Failed to save unit:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus satuan ini?")) return
    try {
      await unitService.remove(id)
      fetchUnits() // Refresh table
    } catch (err) {
      console.error("Failed to delete unit:", err)
      toast.error("Gagal menghapus satuan. Pastikan tidak ada stok yang menggunakan satuan ini.")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Satuan
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari satuan ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Content */}
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-20 text-muted-foreground">
                  Belum ada satuan yang ditambahkan atau ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((unit, i) => (
                <tr key={unit.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{i + 1}.</td>
                  <td className="px-6 py-4 font-medium">{unit.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{unit.abbreviation}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(unit)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title="Edit Satuan"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Tambah Satuan Baru" : "Edit Satuan"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama Satuan</Label>
              <Input
                id="name"
                placeholder="Misal: Kilogram, Liter, Pieces..."
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="abbreviation">Singkatan (Abbreviation)</Label>
              <Input
                id="abbreviation"
                placeholder="Misal: Kg, L, Pcs..."
                value={unitAbbreviation}
                onChange={(e) => setUnitAbbreviation(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!unitName.trim() || !unitAbbreviation.trim() || isSubmitting}
                className="bg-secondary text-primary hover:bg-secondary/90"
              >
                {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
