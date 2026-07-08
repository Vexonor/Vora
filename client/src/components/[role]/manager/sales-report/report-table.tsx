"use client"

import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { downloadReportAsExcel, downloadReportAsPDF } from "@/lib/report-download"
import { sellingReportService } from "@/services/selling-report.service"
import type { SellingReport } from "@/types/selling-report"
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { DeleteReportModal } from "./delete-report-modal"
import { ReportDetailModal } from "./report-detail-modal"

type Props = {
  reports: SellingReport[]
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  onDeleted: () => void | Promise<void>
}

const PAGE_SIZE = 20
const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  })

export function ReportTable({ reports, currentPage, onPageChange, totalPages, onDeleted }: Props) {
  const [detailTarget, setDetailTarget] = useState<SellingReport | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SellingReport | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const paginated = reports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const offset = (currentPage - 1) * PAGE_SIZE

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await sellingReportService.remove(deleteTarget.id)
      // Jika baris terakhir di halaman (bukan halaman 1) dihapus, mundur 1 halaman
      if (paginated.length === 1 && currentPage > 1) {
        onPageChange(currentPage - 1)
      }
      setDeleteTarget(null)
      await onDeleted()
    } finally {
      setIsDeleting(false)
    }
  }

  const getPages = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
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
              <th className="text-right px-6 py-4 font-semibold">Pendapatan bersih</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? paginated.map((report, i) => (
              <tr key={report.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-muted-foreground">{offset + i + 1}.</td>
                <td className="px-6 py-4 font-medium">{report.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatDate(report.date)}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{report.total_transaction}</td>
                <td className="px-6 py-4 text-right font-medium text-primary">{formatCurrency(Number(report.net_profit))}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setDetailTarget(report)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
                    >
                      Detail
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors">
                          <DownloadIcon className="size-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => downloadReportAsExcel(report)}
                          className="gap-2 cursor-pointer"
                        >
                          <FileSpreadsheetIcon className="size-4 text-green-600" />
                          Download Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadReportAsPDF(report)}
                          className="gap-2 cursor-pointer"
                        >
                          <FileTextIcon className="size-4 text-red-500" />
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      onClick={() => setDeleteTarget(report)}
                      title="Hapus laporan"
                      className="p-1.5 rounded-lg border border-foreground/20 hover:border-destructive hover:text-destructive transition-colors"
                    >
                      <Trash2Icon className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground text-sm">
                  Laporan tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {reports.length > 0 && <div className="flex items-center justify-end gap-1 pt-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹ Sebelumnya
        </button>
        {getPages().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`size-8 rounded-lg text-sm font-medium transition-colors border
                ${currentPage === page
                  ? "bg-primary text-white border-primary"
                  : "border-foreground/20 hover:border-primary"
                }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Setelahnya ›
        </button>
      </div>}

      {detailTarget && (
        <ReportDetailModal
          report={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteReportModal
          title={deleteTarget.title}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onClose={() => !isDeleting && setDeleteTarget(null)}
        />
      )}
    </>
  )
}