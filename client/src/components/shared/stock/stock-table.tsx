"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { TablePagination } from "@/components/shared/table-pagination"
import { getStockName } from "@/lib/stock"
import { getStockStatusDisplay } from "@/lib/stock-status"
import type { Stock } from "@/types/stock"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  stocks: Stock[]
  currentPage: number
  totalPages: number
  pageSize: number
  basePath: string
  onPageChange: (page: number) => void
  onDelete: (stock: Stock) => Promise<void>
}

export function StockTable({ stocks, currentPage, totalPages, pageSize, basePath, onPageChange, onDelete }: Props) {
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!stockToDelete) return
    setIsDeleting(true)
    try {
      await onDelete(stockToDelete)
      toast.success("Bahan berhasil dihapus.")
    } catch {
      toast.error("Gagal menghapus bahan. Coba lagi.")
    } finally {
      setIsDeleting(false)
      setStockToDelete(null)
    }
  }

  const rowNumberOffset = (currentPage - 1) * pageSize

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
            {stocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Bahan tidak ditemukan.
                </td>
              </tr>
            )}
            {stocks.map((stock, index) => {
              const statusDisplay = getStockStatusDisplay(stock.status, stock.status_name)
              return (
                <tr key={stock.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + index + 1}.</td>
                  <td className="px-6 py-4 font-medium">{getStockName(stock)}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{stock.quantity}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RowActionsMenu
                      detailHref={`${basePath}/${stock.id}`}
                      editHref={`${basePath}/${stock.id}/edit`}
                      onDelete={() => setStockToDelete(stock)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {stocks.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}

      {stockToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus bahan ${getStockName(stockToDelete)}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setStockToDelete(null)}
        />
      )}
    </>
  )
}
