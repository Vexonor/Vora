"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteMenu } from "@/hooks/queries/use-menus"
import { formatRupiah } from "@/lib/format"
import { getMenuStatusDisplay } from "@/lib/menu-status"
import type { Menu } from "@/types/menu"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  menus: Menu[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const MENU_COLUMNS: DataTableColumn<Menu>[] = [
  { header: "Nama Menu", cellClassName: "font-medium", render: (menu) => menu.name },
  { header: "Harga", align: "center", cellClassName: "text-muted-foreground", render: (menu) => formatRupiah(menu.price) },
  {
    header: "Status",
    align: "center",
    render: (menu) => {
      const statusDisplay = getMenuStatusDisplay(menu.status, menu.status_name)
      return <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
    },
  },
]

export function MenuTable({ menus, ...pagination }: Props) {
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const deleteMenu = useDeleteMenu()

  const handleConfirmDelete = () => {
    if (!menuToDelete) return
    deleteMenu.mutate(menuToDelete.id, {
      onSuccess: () => {
        toast.success("Menu berhasil dihapus.")
        setMenuToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus menu. Coba lagi."),
    })
  }

  const columns: DataTableColumn<Menu>[] = [
    ...MENU_COLUMNS,
    {
      header: "Aksi",
      align: "center",
      render: (menu) => (
        <RowActionsMenu
          detailHref={`/manager/menu/${menu.id}`}
          editHref={`/manager/menu/${menu.id}/edit`}
          onDelete={() => setMenuToDelete(menu)}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={menus}
        getRowKey={(menu) => menu.id}
        emptyMessage="Menu tidak ditemukan."
        {...pagination}
      />

      {menuToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus menu ${menuToDelete.name}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={deleteMenu.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setMenuToDelete(null)}
        />
      )}
    </>
  )
}
