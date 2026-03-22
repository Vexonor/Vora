"use client"

import { MenuTable } from "@/components/[role]/manager/menu/menu-table"
import { MENUS } from "@/lib/constant/menu"
import { CirclePlusIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PAGE_SIZE = 5

export default function ManagerMenuPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = MENUS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/manager/menu/create")}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <CirclePlusIcon className="size-4" />
          Tambah Menu
        </button>

        <div className="flex items-center gap-2">
          <button className="border border-foreground/30 rounded-lg p-2 hover:border-primary transition-colors">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari menu ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <MenuTable
        menus={filtered}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />

    </div>
  )
}