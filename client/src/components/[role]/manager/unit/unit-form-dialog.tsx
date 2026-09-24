"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  unitToEdit: Unit | null
  onSaved: () => void
  onClose: () => void
}

export function UnitFormDialog({ unitToEdit, onSaved, onClose }: Props) {
  const [name, setName] = useState(unitToEdit?.name ?? "")
  const [abbreviation, setAbbreviation] = useState(unitToEdit?.abbreviation ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = unitToEdit !== null
  const canSubmit = name.trim() !== "" && abbreviation.trim() !== "" && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    const payload = { name: name.trim(), abbreviation: abbreviation.trim() }
    setIsSubmitting(true)
    try {
      if (isEditMode) await unitService.update(unitToEdit.id, payload)
      else await unitService.create(payload)
      toast.success("Satuan berhasil disimpan.")
      onSaved()
      onClose()
    } catch {
      toast.error("Gagal menyimpan satuan. Coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Satuan" : "Tambah Satuan Baru"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="unit-name">Nama Satuan</Label>
            <Input
              id="unit-name"
              placeholder="Misal: Kilogram, Liter, Pieces..."
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unit-abbreviation">Singkatan (Abbreviation)</Label>
            <Input
              id="unit-abbreviation"
              placeholder="Misal: Kg, L, Pcs..."
              value={abbreviation}
              onChange={(event) => setAbbreviation(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-secondary text-primary hover:bg-secondary/90"
            >
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
