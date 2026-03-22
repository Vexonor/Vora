"use client"

import { AddTableModal } from "@/components/[role]/manager/table-management/add-table-modal"
import { DeleteTableModal } from "@/components/[role]/manager/table-management/delete-table-modal"
import { TableCard } from "@/components/[role]/manager/table-management/table-card"
import { useSidebar } from "@/components/ui/sidebar"
import { Table, TABLES } from "@/lib/constant/table"
import { CirclePlusIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

export default function TableManagementPage() {
  const { open } = useSidebar()
  const [tables, setTables] = useState<Table[]>(TABLES)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null)

  const filtered = tables.filter((t) =>
    t.tableCode.toLowerCase().includes(search.toLowerCase()) ||
    t.tableNumber.toString().includes(search)
  )

  const handleGenerate = (num: number): string | null => {
    const exists = tables.some((t) => t.tableNumber === num)
    if (exists) return `Meja nomor ${num} sudah ada.`

    const code = `T-${String(num).padStart(2, "0")}`
    const newTable: Table = {
      id: Date.now().toString(),
      tableNumber: num,
      tableCode: code,
      status: "aktif",
      qrValue: `https://vora.app/table/${code}`,
    }

    setTables((prev) =>
      [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber)
    )
    return null
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setTables((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const gridCols = open
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari meja ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className={`grid ${gridCols} gap-3 transition-all duration-200`}>

        {!search && (
          <div
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/20 hover:border-primary transition-colors cursor-pointer min-h-[180px]"
          >
            <CirclePlusIcon className="size-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tambah meja</span>
          </div>
        )}

        {filtered.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {showAddModal && (
        <AddTableModal
          onGenerate={handleGenerate}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteTableModal
          tableCode={deleteTarget.tableCode}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}