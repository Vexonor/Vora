"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteSellingReport } from "@/hooks/queries/use-selling-reports"
import { formatDate, formatRupiah } from "@/lib/format"
import { downloadReportAsExcel, downloadReportAsPdf } from "@/lib/report-download"
import type { SellingReport } from "@/types/selling-report"
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, Trash2Icon, WalletIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ReportDetailModal } from "./report-detail-modal"

type Props = {
  reports: SellingReport[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onEditOperationalCost: (report: SellingReport) => void
}

export function ReportTable({ reports, onEditOperationalCost, ...pagination }: Props) {
  const [reportToView, setReportToView] = useState<SellingReport | null>(null)
  const [reportToDelete, setReportToDelete] = useState<SellingReport | null>(null)
  const deleteSellingReport = useDeleteSellingReport()

  const handleConfirmDelete = () => {
    if (!reportToDelete) return
    deleteSellingReport.mutate(reportToDelete.id, {
      onSuccess: () => {
        toast.success("Laporan berhasil dihapus.")
        setReportToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus laporan. Coba lagi."),
    })
  }

  const columns: DataTableColumn<SellingReport>[] = [
    { header: "Judul", cellClassName: "font-medium", render: (report) => report.title },
    { header: "Tanggal", cellClassName: "text-muted-foreground", render: (report) => formatDate(report.date, "short") },
    { header: "Transaksi", align: "center", cellClassName: "text-muted-foreground", render: (report) => report.total_transaction },
    {
      header: "Modal Operasional",
      align: "right",
      cellClassName: "text-muted-foreground",
      render: (report) => (report.operational_cost != null ? formatRupiah(report.operational_cost) : "—"),
    },
    {
      header: "Pendapatan bersih",
      align: "right",
      cellClassName: "font-medium text-primary",
      render: (report) => formatRupiah(report.net_profit),
    },
    {
      header: "Aksi",
      align: "center",
      render: (report) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEditOperationalCost(report)}
            title="Isi/Edit modal operasional"
            className="p-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
          >
            <WalletIcon className="size-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setReportToView(report)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
          >
            Detail
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors" aria-label="Download laporan">
                <DownloadIcon className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => downloadReportAsExcel(report)} className="gap-2 cursor-pointer">
                <FileSpreadsheetIcon className="size-4 text-green-600" />
                Download Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadReportAsPdf(report)} className="gap-2 cursor-pointer">
                <FileTextIcon className="size-4 text-red-500" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setReportToDelete(report)}
            title="Hapus laporan"
            className="p-1.5 rounded-lg border border-foreground/20 hover:border-destructive hover:text-destructive transition-colors"
          >
            <Trash2Icon className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={reports}
        getRowKey={(report) => report.id}
        emptyMessage="Laporan tidak ditemukan."
        {...pagination}
      />

      {reportToView && <ReportDetailModal report={reportToView} onClose={() => setReportToView(null)} />}

      {reportToDelete && (
        <ConfirmDeleteDialog
          title="Hapus laporan ini?"
          description={
            <>
              Laporan <span className="font-semibold text-foreground">{reportToDelete.title}</span> akan dihapus.
              Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={deleteSellingReport.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setReportToDelete(null)}
        />
      )}
    </>
  )
}
