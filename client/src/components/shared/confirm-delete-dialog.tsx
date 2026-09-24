"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2Icon, Trash2Icon } from "lucide-react"

type Props = {
  title: string
  description: React.ReactNode
  isDeleting?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteDialog({ title, description, isDeleting = false, onConfirm, onClose }: Props) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isDeleting) onClose()
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm text-center" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="size-20 rounded-full border-2 border-destructive/30 flex items-center justify-center">
            <Trash2Icon className="size-10 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-2">
            <DialogTitle className="font-bold text-lg leading-tight">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting && <Loader2Icon className="size-4 animate-spin mr-1" />}
              Ya, Hapus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
