"use client"

import { AddStaffModal } from "@/components/[role]/manager/staff/add-staff-modal"
import { StaffTable } from "@/components/[role]/manager/staff/staff-table"
import { StaffFilterDropdown } from "@/components/shared/staff/staff-filter-dropdown"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { User } from "@/types/user"
import { Loader2Icon, SearchIcon, UserPlusIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const PAGE_SIZE = 5

export default function StaffPage() {
  const [staffs, setStaffs] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchStaffs = useCallback(async (q: string, roles: number[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await userService.getAll({
        q: q || undefined,
        roles: roles.length > 0 ? roles : undefined,
      })
      setStaffs(Array.isArray(data) ? data : [])
    } catch {
      setError("Gagal memuat data staf.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaffs("", [])
  }, [fetchStaffs])

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchStaffs(val, roleFilter)
    }, 400)
  }

  const handleFilterApply = (roles: number[]) => {
    setRoleFilter(roles)
    setCurrentPage(1)
    fetchStaffs(search, roles)
  }

  const totalPages = Math.max(1, Math.ceil(staffs.length / PAGE_SIZE))

  const handleAdd = async (form: { username: string; email: string; role: string | "" }): Promise<{ error: string | null; defaultPassword?: string }> => {
    try {
      const newUser = await authService.register({
        username: form.username,
        email: form.email,
        role: Number(form.role),
      })
      fetchStaffs(search, roleFilter)
      return { error: null, defaultPassword: newUser.default_password }
    } catch {
      return { error: "Gagal menambahkan staf. Silakan coba lagi." }
    }
  }

  const handleDelete = async (staff: User) => {
    try {
      await userService.remove(staff.id)
      setStaffs((prev) => prev.filter((s) => s.id !== staff.id))
    } catch {
      // silent fail
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <UserPlusIcon className="size-4" />
          Tambah Staff
        </button>

        <div className="flex items-center gap-2">
          <StaffFilterDropdown selected={roleFilter} onApply={handleFilterApply} />
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari staff ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => fetchStaffs(search, roleFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <StaffTable
          staffs={staffs}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          onDelete={handleDelete}
        />
      )}

      {showAddModal && (
        <AddStaffModal
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

    </div>
  )
}
