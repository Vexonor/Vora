"use client"

import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/types/user"
import { UserRole } from "@/types/user"
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { DeleteStaffModal } from "./delete-staff-modal"

const ROLE_BADGE: Record<number, { label: string; badgeClass: string }> = {
  [UserRole.MANAGER]: { label: "Manager", badgeClass: "border-primary/40 bg-primary/10 text-primary" },
  [UserRole.CASHIER]: { label: "Kasir", badgeClass: "border-secondary/40 bg-secondary/10 text-secondary" },
  [UserRole.KITCHEN]: { label: "Kitchen", badgeClass: "border-amber-500/40 bg-amber-50 text-amber-600" },
}

type Props = {
  staffs: User[]
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
  onDelete: (staff: User) => void
}

const PAGE_SIZE = 5

export function StaffTable({ staffs, currentPage, onPageChange, totalPages, onDelete }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const paginated = staffs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
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

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-foreground/10 overflow-x-auto">
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-left px-6 py-4 font-semibold w-16">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Username</th>
              <th className="text-left px-6 py-4 font-semibold">Email</th>
              <th className="text-center px-6 py-4 font-semibold">Role</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Staf tidak ditemukan.
                </td>
              </tr>
            )}
            {paginated.map((staff, i) => {
              const config = ROLE_BADGE[staff.role] ?? { label: staff.role_name ?? "Unknown", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground" }
              return (
                <tr key={staff.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{offset + i + 1}.</td>
                  <td className="px-6 py-4 font-medium">{staff.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{staff.email}</td>
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
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <PencilIcon className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(staff)}
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
      {staffs.length > 0 && (
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
        <DeleteStaffModal
          username={deleteTarget.username}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}