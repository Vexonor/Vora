"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { TablePagination } from "@/components/shared/table-pagination"
import { paginate } from "@/lib/pagination"
import { useAuth } from "@/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api-error"
import { getUserRoleDisplay } from "@/lib/user-role"
import type { User } from "@/types/user"
import { useState } from "react"
import { toast } from "sonner"
import { EditStaffModal } from "./edit-staff-modal"

type Props = {
  staffMembers: User[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onDelete: (staff: User) => Promise<void>
  onUpdated: () => void | Promise<void>
}

export function StaffTable({ staffMembers, currentPage, totalPages, pageSize, onPageChange, onDelete, onUpdated }: Props) {
  const { user: currentUser } = useAuth()
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null)
  const [staffToEdit, setStaffToEdit] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const visibleStaff = paginate(staffMembers, currentPage, pageSize)
  const rowNumberOffset = (currentPage - 1) * pageSize

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return
    setIsDeleting(true)
    try {
      await onDelete(staffToDelete)
      toast.success("Staf berhasil dihapus.")
      setStaffToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal menghapus staf. Coba lagi."))
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
              <th className="text-left px-6 py-4 font-semibold w-16">No.</th>
              <th className="text-left px-6 py-4 font-semibold">Username</th>
              <th className="text-left px-6 py-4 font-semibold">Email</th>
              <th className="text-center px-6 py-4 font-semibold">Role</th>
              <th className="text-center px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Staf tidak ditemukan.
                </td>
              </tr>
            )}
            {visibleStaff.map((staff, index) => {
              const roleDisplay = getUserRoleDisplay(staff.role, staff.role_name)
              return (
                <tr key={staff.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + index + 1}.</td>
                  <td className="px-6 py-4 font-medium">{staff.username}</td>
                  <td className="px-6 py-4 text-muted-foreground">{staff.email}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge label={roleDisplay.label} tone={roleDisplay.tone} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {staff.id === currentUser?.id ? (
                      <span className="text-xs text-muted-foreground italic">Akun Anda</span>
                    ) : (
                      <RowActionsMenu
                        onEdit={() => setStaffToEdit(staff)}
                        onDelete={() => setStaffToDelete(staff)}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {staffMembers.length > 0 && (
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}

      {staffToDelete && (
        <ConfirmDeleteDialog
          title="Hapus staf ini?"
          description={
            <>
              Staff <span className="font-semibold text-foreground">{staffToDelete.username}</span> akan dihapus
              secara permanen. Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setStaffToDelete(null)}
        />
      )}

      {staffToEdit && (
        <EditStaffModal
          staff={staffToEdit}
          onSaved={onUpdated}
          onClose={() => setStaffToEdit(null)}
        />
      )}
    </>
  )
}
