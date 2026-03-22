"use client"

import { SalesReport } from "@/lib/constant/sales-report"
import { useState } from "react"
import { ReportDetailModal } from "./report-detail-modal"

type Props = {
  reports: SalesReport[]
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

const PAGE_SIZE = 5
const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  })

export function ReportTable({ reports, currentPage, onPageChange, totalPages }: Props) {
  const [detailTarget, setDetailTarget] = useState<SalesReport | null>(null)

  const paginated = reports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const offset = (currentPage - 1) * PAGE_SIZE

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
                <td className="px-6 py-4 text-center text-muted-foreground">{report.totalTransactions}</td>
                <td className="px-6 py-4 text-right font-medium text-primary">{formatCurrency(report.netRevenue)}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setDetailTarget(report)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                  Belum ada laporan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-1 pt-2">
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
      </div>

      {detailTarget && (
        <ReportDetailModal
          report={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </>
  )
}