"use client"

import type { Stock } from "@/types/stock"
import { StockStatus } from "@/types/stock"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteStockModal } from "./delete-stock-modal"
import { StockActionDropdown } from "./stock-action-dropdown"

const STOCK_STATUS_BADGE: Record<number, { label: string; badgeClass: string }> = {
  [StockStatus.IN_STOCK]: { label: "Tersedia", badgeClass: "border-primary/40 bg-primary/10 text-primary" },
  [StockStatus.LOW_STOCK]: { label: "Menipis", badgeClass: "border-amber-500/40 bg-amber-50 text-amber-600" },
  [StockStatus.OUT_OF_STOCK]: { label: "Habis", badgeClass: "border-destructive/40 bg-destructive/10 text-destructive" },
  [StockStatus.DISCONTINUED]: { label: "Tidak Aktif", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground/60" },
  [StockStatus.ON_ORDER]: { label: "Menunggu Supplier", badgeClass: "border-blue-500/40 bg-blue-50 text-blue-600" },
}

type Props = {
  stocks: Stock[]
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  basePath: string
  onDelete: (stock: Stock) => Promise<void>
}

const PAGE_SIZE = 5

export function StockTable({ stocks, currentPage, onPageChange, totalPages, basePath, onDelete }: Props) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Stock | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const paginated = stocks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
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
              <th className="text-left px-6 py-4 font-semibold text-foreground w-20">No.</th>
              <th className="text-left px-6 py-4 font-semibold text-foreground">Nama Bahan</th>
              <th className="text-center px-6 py-4 font-semibold text-foreground">Jumlah Bahan</th>
              <th className="text-center px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="text-center px-6 py-4 font-semibold text-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Bahan tidak ditemukan.
                </td>
              </tr>
            )}
            {paginated.map((stock, i) => {
              const config = STOCK_STATUS_BADGE[stock.status] ?? { label: stock.status_name ?? "Unknown", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground" }
              return (
                <tr key={stock.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{offset + i + 1}.</td>
                  <td className="px-6 py-4 font-medium">{stock.name ?? `Stock #${stock.id}`}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{stock.quantity}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StockActionDropdown
                      onDetail={() => router.push(`${basePath}/${stock.id}`)}
                      onEdit={() => router.push(`${basePath}/${stock.id}/edit`)}
                      onDelete={() => setDeleteTarget(stock)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {stocks.length > 0 && (
        <div className="flex items-center justify-end gap-1 pt-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-sm px-3 py-1.5 rounded-lg hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            className="text-sm px-3 py-1.5 rounded-lg hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Setelahnya ›
          </button>
        </div>
      )}

      {deleteTarget && (
        <DeleteStockModal
          stockName={deleteTarget.name ?? `Stock #${deleteTarget.id}`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
