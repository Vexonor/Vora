"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { paginate, TablePagination } from "@/components/shared/table-pagination"
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
  onDelete: (menu: Menu) => Promise<void>
}

export function MenuTable({ menus, currentPage, totalPages, pageSize, onPageChange, onDelete }: Props) {
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const visibleMenus = paginate(menus, currentPage, pageSize)
  const rowNumberOffset = (currentPage - 1) * pageSize

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return
    setIsDeleting(true)
    try {
      await onDelete(menuToDelete)
      toast.success("Menu berhasil dihapus.")
      setMenuToDelete(null)
    } catch {
      toast.error("Gagal menghapus menu. Coba lagi.")
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
              <th className="text-left px-6 py-4 font-semibold w-20">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Nama Menu</th>
              <th className="text-center px-6 py-4 font-semibold">Harga</th>
              <th className="text-center px-6 py-4 font-semibold">Status</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleMenus.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Menu tidak ditemukan.
                </td>
              </tr>
            )}
            {visibleMenus.map((menu, index) => {
              const statusDisplay = getMenuStatusDisplay(menu.status, menu.status_name)
              return (
                <tr key={menu.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + index + 1}.</td>
                  <td className="px-6 py-4 font-medium">{menu.name}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{formatRupiah(menu.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RowActionsMenu
                      detailHref={`/manager/menu/${menu.id}`}
                      editHref={`/manager/menu/${menu.id}/edit`}
                      onDelete={() => setMenuToDelete(menu)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {menus.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}

      {menuToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus menu ${menuToDelete.name}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setMenuToDelete(null)}
        />
      )}
    </>
  )
}
