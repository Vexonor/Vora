"use client"

import { AddReportModal } from "@/components/[role]/manager/sales-report/add-report-modal"
import { ReportTable } from "@/components/[role]/manager/sales-report/report-table"
import { SALES_REPORTS, SalesReport } from "@/lib/constant/sales-report"
import { PlusIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

const PAGE_SIZE = 5

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function SalesReportPage() {
  const [reports, setReports] = useState<SalesReport[]>(SALES_REPORTS)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const totalTransactions = reports.reduce((sum, r) => sum + r.totalTransactions, 0)
  const totalProducts = reports.reduce((sum, r) => sum + r.totalProducts, 0)
  const totalNetRevenue = reports.reduce((sum, r) => sum + r.netRevenue, 0)
  const totalCapital = reports.reduce((sum, r) => sum + r.capital, 0)

  const handleAdd = (form: {
    title: string; date: string; totalTransactions: string
    totalProducts: string; capital: string; grossRevenue: string; netRevenue: string
  }): string | null => {
    const newReport: SalesReport = {
      id: Date.now().toString(),
      title: form.title,
      date: form.date,
      totalTransactions: Number(form.totalTransactions),
      totalProducts: Number(form.totalProducts),
      capital: Number(form.capital),
      grossRevenue: Number(form.grossRevenue),
      netRevenue: Number(form.netRevenue),
    }
    setReports((prev) => [newReport, ...prev])
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total transaksi", value: totalTransactions.toLocaleString("id-ID") },
          { label: "Total produk terjual", value: totalProducts.toLocaleString("id-ID") },
          { label: "Pendapatan bersih", value: formatCurrency(totalNetRevenue) },
          { label: "Modal", value: formatCurrency(totalCapital) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-foreground/10 p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-bold text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Laporan
        </button>

        <div className="flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari laporan ..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabel */}
      <ReportTable
        reports={filtered}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />

      {showAddModal && (
        <AddReportModal
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

    </div>
  )
}