"use client"

import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { MenuStatus } from "@/types/menu"
import { EllipsisIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DeleteMenuModal } from "./delete-menu-modal"

export const MENU_STATUS_BADGE: Record<number, { label: string; badgeClass: string }> = {
  [MenuStatus.AVAILABLE]: { label: "Tersedia", badgeClass: "border-primary/40 bg-primary/10 text-primary" },
  [MenuStatus.SOLD_OUT]: { label: "Habis", badgeClass: "border-destructive/40 bg-destructive/10 text-destructive" },
  [MenuStatus.INACTIVE]: { label: "Tidak Aktif", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground/60" },
}

type Props = {
  menus: Menu[]
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  onDeleted: () => void | Promise<void>
}

const PAGE_SIZE = 5
const formatCurrency = (value: number) => `Rp. ${value.toLocaleString("id-ID")}`

export function MenuTable({ menus, currentPage, onPageChange, totalPages, onDeleted }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const paginated = menus.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const offset = (currentPage - 1) * PAGE_SIZE

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await menuService.remove(deleteTarget.id)
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
              <th className="text-left px-6 py-4 font-semibold w-20">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Nama Menu</th>
              <th className="text-center px-6 py-4 font-semibold">Harga</th>
              <th className="text-center px-6 py-4 font-semibold">Status</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Menu tidak ditemukan.
                </td>
              </tr>
            )}
            {paginated.map((menu, i) => {
              const config = MENU_STATUS_BADGE[menu.status] ?? { label: menu.status_name ?? "Unknown", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground" }
              return (
                <tr key={menu.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{offset + i + 1}.</td>
                  <td className="px-6 py-4 font-medium">{menu.name}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">
                    {formatCurrency(menu.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded-md transition-colors">
                          <EllipsisIcon className="size-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                          <Link href={`/manager/menu/${menu.id}`}>
                            <EyeIcon className="size-4" /> Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                          <Link href={`/manager/menu/${menu.id}/edit`}>
                            <PencilIcon className="size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(menu)}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2Icon className="size-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {menus.length > 0 && (
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
      )}

      {deleteTarget && (
        <DeleteMenuModal
          menuName={deleteTarget.name}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => !isDeleting && setDeleteTarget(null)}
        />
      )}
    </>
  )
}