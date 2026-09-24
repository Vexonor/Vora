"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { paginate, TablePagination } from "@/components/shared/table-pagination"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  onDelete: (report: SellingReport) => Promise<void>
  onEditOperationalCost: (report: SellingReport) => void
}

export function ReportTable({
  reports,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onDelete,
  onEditOperationalCost,
}: Props) {
  const [reportToView, setReportToView] = useState<SellingReport | null>(null)
  const [reportToDelete, setReportToDelete] = useState<SellingReport | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const visibleReports = paginate(reports, currentPage, pageSize)
  const rowNumberOffset = (currentPage - 1) * pageSize

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return
    setIsDeleting(true)
    try {
      await onDelete(reportToDelete)
      toast.success("Laporan berhasil dihapus.")
      setReportToDelete(null)
    } catch {
      toast.error("Gagal menghapus laporan. Coba lagi.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-foreground/10 overflow-x-auto">
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-left px-6 py-4 font-semibold w-14">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Judul</th>
              <th className="text-left px-6 py-4 font-semibold">Tanggal</th>
              <th className="text-center px-6 py-4 font-semibold">Transaksi</th>
              <th className="text-right px-6 py-4 font-semibold">Modal Operasional</th>
              <th className="text-right px-6 py-4 font-semibold">Pendapatan bersih</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleReports.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground text-sm">
                  Laporan tidak ditemukan.
                </td>
              </tr>
            )}
            {visibleReports.map((report, index) => (
              <tr key={report.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + index + 1}.</td>
                <td className="px-6 py-4 font-medium">{report.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatDate(report.date, "short")}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{report.total_transaction}</td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  {report.operational_cost != null ? formatRupiah(report.operational_cost) : "—"}
                </td>
                <td className="px-6 py-4 text-right font-medium text-primary">{formatRupiah(report.net_profit)}</td>
                <td className="px-6 py-4 text-center">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}

      {reportToView && (
        <ReportDetailModal report={reportToView} onClose={() => setReportToView(null)} />
      )}

      {reportToDelete && (
        <ConfirmDeleteDialog
          title="Hapus laporan ini?"
          description={
            <>
              Laporan <span className="font-semibold text-foreground">{reportToDelete.title}</span> akan dihapus.
              Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setReportToDelete(null)}
        />
      )}
    </>
  )
}
