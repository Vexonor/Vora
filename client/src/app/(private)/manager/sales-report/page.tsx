"use client"

import { AddReportModal } from "@/components/[role]/manager/sales-report/add-report-modal"
import { PredictionChart } from "@/components/[role]/manager/sales-report/prediction-chart"
import { ReportTable } from "@/components/[role]/manager/sales-report/report-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sellingReportService } from "@/services/selling-report.service"
import type { SellingReport } from "@/types/selling-report"
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const PAGE_SIZE = 5

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function SalesReportPage() {
  const [reports, setReports] = useState<SellingReport[]>([])
  const [search, setSearch] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchReports = useCallback(async (q: string, month: string, year: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await sellingReportService.getAll({
        q: q || undefined,
        month: month || undefined,
        year: year || undefined,
      })
      setReports(Array.isArray(data) ? data : [])
    } catch {
      setError("Gagal memuat laporan penjualan.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports("", "", "")
  }, [fetchReports])

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))

  const handleSearch = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchReports(val, monthFilter, yearFilter)
    }, 400)
  }

  const handleMonthChange = (val: string) => {
    setMonthFilter(val)
    setCurrentPage(1)
    fetchReports(search, val, yearFilter)
  }

  const handleYearChange = (val: string) => {
    setYearFilter(val)
    setCurrentPage(1)
    fetchReports(search, monthFilter, val)
  }

  const totalTransactions = reports.reduce((sum, r) => sum + Number(r.total_transaction), 0)
  const totalProducts = reports.reduce((sum, r) => sum + Number(r.total_items_sold), 0)
  const totalNetRevenue = reports.reduce((sum, r) => sum + Number(r.net_profit), 0)
  const totalCapital = reports.reduce((sum, r) => sum + Number(r.unit_cost), 0)

  const handleAdd = async (form: {
    title: string; date: string; totalTransactions: string
    totalProducts: string; capital: string; grossRevenue: string; netRevenue: string
  }): Promise<void> => {
    await sellingReportService.create({
      title: form.title.trim(),
      date: form.date,
      total_transaction: Number(form.totalTransactions),
      total_items_sold: Number(form.totalProducts),
      unit_cost: Number(form.capital),
      gross_revenue: Number(form.grossRevenue),
      net_profit: Number(form.netRevenue),
    })
    await fetchReports(search, monthFilter, yearFilter)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">

      {/* AI Prediction */}
      <PredictionChart />

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Laporan
        </button>

        <div className="flex items-center gap-2">
          {/* Year filter */}
          <Select
            value={yearFilter || "all"}
            onValueChange={(v) => handleYearChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month filter */}
          <Select
            value={monthFilter || "all"}
            onValueChange={(v) => handleMonthChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
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
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => fetchReports(search, monthFilter, yearFilter)} className="text-sm text-primary underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <ReportTable
          reports={reports}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          onDeleted={() => fetchReports(search, monthFilter, yearFilter)}
        />
      )}

      {showAddModal && (
        <AddReportModal
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

    </div>
  )
}