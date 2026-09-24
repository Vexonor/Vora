"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { CirclePlusIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  onCreateTable: (tableNumber: number) => Promise<string | null>
  onClose: () => void
}

export function AddTableModal({ onCreateTable, onClose }: Props) {
  const [tableNumber, setTableNumber] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting) return
    const parsedTableNumber = parseInt(tableNumber, 10)
    if (!tableNumber || isNaN(parsedTableNumber) || parsedTableNumber <= 0) {
      setError("Masukkan nomor meja yang valid.")
      return
    }
    setIsSubmitting(true)
    const errorMessage = await onCreateTable(parsedTableNumber)
    setIsSubmitting(false)
    if (errorMessage) {
      toast.error(errorMessage)
      return
    }
    toast.success("Meja berhasil ditambahkan.")
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah meja baru</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <FormField label="Nomor meja" error={error}>
            <Input
              autoFocus
              type="number"
              min={1}
              placeholder="contoh: 8"
              value={tableNumber}
              onChange={(event) => { setTableNumber(event.target.value); setError("") }}
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              aria-invalid={!!error}
            />
          </FormField>
          <p className="text-xs text-muted-foreground">
            QR code akan di-generate otomatis. Pelanggan dapat scan QR untuk melihat menu.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <CirclePlusIcon className="size-4" />}
              {isSubmitting ? "Membuat..." : "Generate QR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
