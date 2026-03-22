"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SalesReport } from "@/lib/constant/sales-report"

type Props = {
  report: SalesReport
  onClose: () => void
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })

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
              <p className="font-bold text-lg">{report.totalTransactions}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Total produk terjual</p>
              <p className="font-bold text-lg">{report.totalProducts.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <hr className="border-foreground/10" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modal</span>
              <span className="font-medium">{formatCurrency(report.capital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendapatan kotor</span>
              <span className="font-medium">{formatCurrency(report.grossRevenue)}</span>
            </div>
            <hr className="border-foreground/10 my-1" />
            <div className="flex justify-between font-bold text-base">
              <span>Pendapatan bersih</span>
              <span className="text-primary">{formatCurrency(report.netRevenue)}</span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-secondary text-primary hover:bg-secondary/90"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}