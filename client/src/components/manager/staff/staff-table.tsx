"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteStaff } from "@/hooks/queries/use-staff"
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
  onPageSizeChange: (pageSize: number) => void
}

export function StaffTable({ staffMembers, ...pagination }: Props) {
  const { user: currentUser } = useAuth()
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null)
  const [staffToEdit, setStaffToEdit] = useState<User | null>(null)
  const deleteStaff = useDeleteStaff()

  const handleConfirmDelete = () => {
    if (!staffToDelete) return
    deleteStaff.mutate(staffToDelete.id, {
      onSuccess: () => {
        toast.success("Staf berhasil dihapus.")
        setStaffToDelete(null)
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Gagal menghapus staf. Coba lagi.")),
    })
  }

  const columns: DataTableColumn<User>[] = [
    { header: "Username", cellClassName: "font-medium", render: (staff) => staff.username },
    { header: "Email", cellClassName: "text-muted-foreground", render: (staff) => staff.email },
    {
      header: "Role",
      align: "center",
      render: (staff) => {
        const roleDisplay = getUserRoleDisplay(staff.role, staff.role_name)
        return <StatusBadge label={roleDisplay.label} tone={roleDisplay.tone} />
      },
    },
    {
      header: "Aksi",
      align: "center",
      render: (staff) =>
        staff.id === currentUser?.id ? (
          <span className="text-xs text-muted-foreground italic">Akun Anda</span>
        ) : (
          <RowActionsMenu onEdit={() => setStaffToEdit(staff)} onDelete={() => setStaffToDelete(staff)} />
        ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={staffMembers}
        getRowKey={(staff) => staff.id}
        emptyMessage="Staf tidak ditemukan."
        {...pagination}
      />

      {staffToDelete && (
        <ConfirmDeleteDialog
          title="Hapus staf ini?"
          description={
            <>
              Staff <span className="font-semibold text-foreground">{staffToDelete.username}</span> akan dihapus
              secara permanen. Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={deleteStaff.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setStaffToDelete(null)}
        />
      )}

      {staffToEdit && <EditStaffModal staff={staffToEdit} onClose={() => setStaffToEdit(null)} />}
    </>
  )
}
