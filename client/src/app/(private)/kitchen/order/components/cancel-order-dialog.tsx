"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2Icon, XCircleIcon } from "lucide-react"
import { useState } from "react"

const OTHER_REASON = "Lainnya"
const CANCEL_REASONS = ["Stok bahan habis", "Menu tidak tersedia", "Permintaan pelanggan", OTHER_REASON]

type Props = {
  placeName: string
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

export function CancelOrderDialog({ placeName, isSubmitting, onConfirm, onClose }: Props) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  const isOtherReason = selectedReason === OTHER_REASON
  const finalReason = isOtherReason ? customReason.trim() : selectedReason
  const canSubmit = finalReason.length > 0 && !isSubmitting

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) onClose()
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <XCircleIcon className="size-14 text-destructive" />
          </div>
          <DialogTitle className="text-center text-lg">Batalkan Pesanan?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center">
          Pesanan <span className="font-semibold text-foreground">{placeName}</span> akan dibatalkan.
          Pilih alasan pembatalan.
        </p>

        <div className="flex flex-col gap-3 mt-1">
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger>
              <SelectValue placeholder="— Pilih alasan —" />
            </SelectTrigger>
            <SelectContent>
              {CANCEL_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>{reason}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isOtherReason && (
            <Textarea
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
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
            {isSubmitting && <Loader2Icon className="size-4 animate-spin mr-1" />}
            Ya, Batalkan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
