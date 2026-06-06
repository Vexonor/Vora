"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircleIcon } from "lucide-react"

type Props = {
  tableName: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmCompleteModal({ tableName, onConfirm, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <CheckCircleIcon className="size-14 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">Selesaikan Pesanan?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Konfirmasi bahwa pesanan <span className="font-semibold text-foreground">{tableName}</span> telah selesai dibuat dan siap untuk disajikan.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onConfirm} className="bg-primary text-white hover:bg-primary/90">
            Ya, Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}