"use client"

import { AddStaffModal } from "@/components/manager/staff/add-staff-modal"
import { StaffTable } from "@/components/manager/staff/staff-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { USER_ROLE_OPTIONS } from "@/lib/user-role"
import { userService } from "@/services/user.service"
import type { User } from "@/types/user"
import { UserPlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 20

export default function ManagerStaffPage() {
  const [staffMembers, setStaffMembers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchStaffMembers = useCallback(async (searchTerm: string, roles: number[]) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const data = await userService.getAll({
        q: searchTerm || undefined,
        roles: roles.length > 0 ? roles : undefined,
      })
      if (isLatest()) setStaffMembers(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest()) setError("Gagal memuat data staf.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchStaffMembers(debouncedSearch, roleFilter)
  }, [fetchStaffMembers, debouncedSearch, roleFilter])

  const reloadStaffMembers = () => fetchStaffMembers(debouncedSearch, roleFilter)

  const handleDelete = async (staff: User) => {
    await userService.remove(staff.id)
    setStaffMembers((previous) => previous.filter((member) => member.id !== staff.id))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleRoleFilterApply = (roles: number[]) => {
    setRoleFilter(roles)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(staffMembers.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, totalPages)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <UserPlusIcon className="size-4" />
          Tambah Staff
        </button>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Role"
            options={USER_ROLE_OPTIONS}
            selectedValues={roleFilter}
            onApply={handleRoleFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari staff ..." />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadStaffMembers} />
      ) : (
        <StaffTable
          staffMembers={staffMembers}
          currentPage={visiblePage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
          onUpdated={reloadStaffMembers}
        />
      )}

      {isAddModalOpen && (
        <AddStaffModal
          onCreated={reloadStaffMembers}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  )
}
