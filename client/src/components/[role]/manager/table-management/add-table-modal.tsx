"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CirclePlusIcon } from "lucide-react"
import { useState } from "react"

type Props = {
  onGenerate: (tableNumber: number) => string | null
  onClose: () => void
}

export function AddTableModal({ onGenerate, onClose }: Props) {
  const [tableNumber, setTableNumber] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const num = parseInt(tableNumber)
    if (!tableNumber || isNaN(num) || num <= 0) {
      setError("Masukkan nomor meja yang valid.")
      return
    }
    const errorMsg = onGenerate(num)
    if (errorMsg) {
      setError(errorMsg)
      return
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah meja baru</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Nomor meja</Label>
            <Input
              autoFocus
              type="number"
              min={1}
              placeholder="contoh: 8"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`border ${error ? "border-destructive" : "border-primary"}`}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            QR code akan di-generate otomatis. Pelanggan dapat scan QR untuk melihat menu.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              <CirclePlusIcon className="size-4" />
              Generate QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}