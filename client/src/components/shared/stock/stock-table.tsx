"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteStock } from "@/hooks/queries/use-stocks"
import { getStockName } from "@/lib/stock"
import { getStockStatusDisplay } from "@/lib/stock-status"
import type { Stock } from "@/types/stock"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  stocks: Stock[]
  basePath: string
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isRefreshing: boolean
}

export function StockTable({ stocks, basePath, ...pagination }: Props) {
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null)
  const deleteStock = useDeleteStock()

  const handleConfirmDelete = () => {
    if (!stockToDelete) return
    deleteStock.mutate(stockToDelete.id, {
      onSuccess: () => {
        toast.success("Bahan berhasil dihapus.")
        setStockToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus bahan. Coba lagi."),
    })
  }

  const columns: DataTableColumn<Stock>[] = [
    { header: "Nama Bahan", cellClassName: "font-medium", render: getStockName },
    { header: "Jumlah Bahan", align: "center", cellClassName: "text-muted-foreground", render: (stock) => stock.quantity },
    {
      header: "Status",
      align: "center",
      render: (stock) => {
        const statusDisplay = getStockStatusDisplay(stock.status, stock.status_name)
        return <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
      },
    },
    {
      header: "Aksi",
      align: "center",
      render: (stock) => (
        <RowActionsMenu
          detailHref={`${basePath}/${stock.id}`}
          editHref={`${basePath}/${stock.id}/edit`}
          onDelete={() => setStockToDelete(stock)}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={stocks}
        getRowKey={(stock) => stock.id}
        emptyMessage="Bahan tidak ditemukan."
        {...pagination}
      />

      {stockToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus bahan ${getStockName(stockToDelete)}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={deleteStock.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setStockToDelete(null)}
        />
      )}
    </>
  )
}
