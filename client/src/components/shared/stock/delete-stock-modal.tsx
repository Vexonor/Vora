"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Trash2Icon } from "lucide-react"

type Props = {
  stockName: string
  onConfirm: () => void
  onClose: () => void
}

export function DeleteStockModal({ stockName, onConfirm, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="size-20 rounded-full border-2 border-destructive/30 flex items-center justify-center">
            <Trash2Icon className="size-10 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg leading-tight">
              Apakah anda yakin ingin<br />menghapus data {stockName}?
            </h3>
            <p className="text-sm text-muted-foreground">
              Data yang dihapus tidak dapat dipulihkan. Pastikan Anda
              benar-benar ingin melanjutkan tindakan ini.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="w-full">
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              className="w-full bg-destructive hover:bg-destructive/90 text-white"
            >
              Ya
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}