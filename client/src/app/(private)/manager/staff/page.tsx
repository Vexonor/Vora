"use client"

import { AddStaffModal } from "@/components/[role]/manager/staff/add-staff-modal"
import { StaffTable } from "@/components/[role]/manager/staff/staff-table"
import { Staff, StaffRole, STAFFS } from "@/lib/constant/staff"
import { SearchIcon, SlidersHorizontalIcon, UserPlusIcon } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE = 5

export default function StaffPage() {
  const [staffs, setStaffs] = useState<Staff[]>(STAFFS)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = staffs.filter((s) =>
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleAdd = (form: { username: string; email: string; role: StaffRole | "" }): string | null => {
    const emailExists = staffs.some((s) => s.email === form.email)
    if (emailExists) return "Email sudah digunakan."

    const usernameExists = staffs.some((s) => s.username === form.username)
    if (usernameExists) return "Username sudah digunakan."

    const newStaff: Staff = {
      id: Date.now().toString(),
      username: form.username,
      email: form.email,
      role: form.role as StaffRole,
      status: "aktif",
    }
    setStaffs((prev) => [...prev, newStaff])
    return null
  }

  const handleDelete = (staff: Staff) => {
    setStaffs((prev) => prev.filter((s) => s.id !== staff.id))
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">

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
          <button className="border border-foreground/30 rounded-lg p-2 hover:border-primary transition-colors">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          </button>
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

      <StaffTable
        staffs={filtered}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        onDelete={handleDelete}
      />

      {showAddModal && (
        <AddStaffModal
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

    </div>
  )
}