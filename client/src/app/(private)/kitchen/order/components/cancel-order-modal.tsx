"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { XCircleIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"

const REASONS = [
  "Stok bahan habis",
  "Menu tidak tersedia",
  "Permintaan pelanggan",
  "Lainnya",
] as const

type Props = {
  tableName: string
  isSubmitting?: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

export function CancelOrderModal({ tableName, isSubmitting, onConfirm, onClose }: Props) {
  const [choice, setChoice] = useState<string>("")
  const [note, setNote] = useState<string>("")

  const isOther = choice === "Lainnya"
  const finalReason = isOther ? note.trim() : choice
  const canSubmit = finalReason.length > 0 && !isSubmitting

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <XCircleIcon className="size-14 text-destructive" />
          </div>
          <DialogTitle className="text-center text-lg">Batalkan Pesanan?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center">
          Pesanan <span className="font-semibold text-foreground">{tableName}</span> akan dibatalkan.
          Pilih alasan pembatalan.
        </p>

        <div className="flex flex-col gap-3 mt-1">
          <Select value={choice} onValueChange={setChoice}>
            <SelectTrigger>
              <SelectValue placeholder="— Pilih alasan —" />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isOther && (
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis alasan pembatalan…"
              maxLength={255}
              rows={3}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Kembali
          </Button>
          <Button
            onClick={() => onConfirm(finalReason)}
            disabled={!canSubmit}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isSubmitting ? <Loader2Icon className="size-4 animate-spin mr-1" /> : null}
            Ya, Batalkan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
