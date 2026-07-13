"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sellingReportService } from "@/services/selling-report.service"
import type { SellingReport } from "@/types/selling-report"
import { formatThousands, digitsOnly } from "@/lib/currency"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  report: SellingReport
  onSaved: () => void | Promise<void>
  onClose: () => void
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

export function OperationalCostModal({ report, onSaved, onClose }: Props) {
  const [value, setValue] = useState(
    report.operational_cost != null ? String(Number(report.operational_cost)) : "",
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (value.trim() === "" || isNaN(Number(value)) || Number(value) < 0) {
      setError("Masukkan angka modal yang valid (minimal 0).")
      return
    }
    setIsSaving(true)
    try {
      await sellingReportService.updateOperationalCost(report.id, Number(value))
      toast.success("Modal operasional berhasil disimpan.")
      await onSaved()
      onClose()
    } catch {
      toast.error("Gagal menyimpan modal operasional. Coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !isSaving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modal Operasional Harian</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Laporan <span className="font-medium text-foreground">{report.title}</span> — {formatDate(report.date)}
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="operational-cost">Modal operasional (Rp)</Label>
            <Input
              id="operational-cost"
              type="text"
              inputMode="numeric"
              placeholder="Misal: 850.000"
              value={formatThousands(value)}
              onChange={(e) => { setValue(digitsOnly(e.target.value)); setError(null) }}
              autoFocus
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Belanja bahan harian, gas, kemasan, es, dll. Laba bersih dihitung ulang otomatis.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
