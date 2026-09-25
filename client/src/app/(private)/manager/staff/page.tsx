"use client"

import { AddStaffModal } from "@/components/manager/staff/add-staff-modal"
import { StaffTable } from "@/components/manager/staff/staff-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useStaffList } from "@/hooks/queries/use-staff"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView, paginate } from "@/lib/pagination"
import { USER_ROLE_OPTIONS } from "@/lib/user-role"
import { UserPlusIcon } from "lucide-react"
import { useState } from "react"

export default function ManagerStaffPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<number[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const staffListQuery = useStaffList({ search: debouncedSearch, roles: roleFilter })
  const staffMembers = staffListQuery.data ?? []
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, staffMembers.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleRoleFilterApply = (roles: number[]) => {
    setRoleFilter(roles)
    pagination.resetToFirstPage()
  }

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

      {staffListQuery.isPending ? (
        <PageLoader />
      ) : staffListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data staf." onRetry={() => staffListQuery.refetch()} />
      ) : (
        <StaffTable
          staffMembers={paginate(staffMembers, currentPage, pagination.pageSize)}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {isAddModalOpen && <AddStaffModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  )
}
