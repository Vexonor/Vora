"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, formatNumber, formatRupiah } from "@/lib/format"
import type { SellingReport } from "@/types/selling-report"

type Props = {
  report: SellingReport
  onClose: () => void
}

export function ReportDetailModal({ report, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">{formatDate(report.date)}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Total transaksi</p>
              <p className="font-bold text-lg">{report.total_transaction}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Total produk terjual</p>
              <p className="font-bold text-lg">{formatNumber(report.total_items_sold)}</p>
            </div>
          </div>

          <hr className="border-foreground/10" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modal</span>
              <span className="font-medium">{formatRupiah(report.unit_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendapatan kotor</span>
              <span className="font-medium">{formatRupiah(report.gross_revenue)}</span>
            </div>
            <hr className="border-foreground/10 my-1" />
            <div className="flex justify-between font-bold text-base">
              <span>Pendapatan bersih</span>
              <span className="text-primary">{formatRupiah(report.net_profit)}</span>
            </div>
          </div>

          <Button onClick={onClose} className="w-full bg-secondary text-white hover:bg-secondary/90">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
