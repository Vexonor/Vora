"use client"

import { AddReportModal } from "@/components/[role]/manager/sales-report/add-report-modal"
import { OperationalCostModal } from "@/components/[role]/manager/sales-report/operational-cost-modal"
import { PredictionAccuracyChart } from "@/components/[role]/manager/sales-report/prediction-accuracy-chart"
import { PredictionChart } from "@/components/[role]/manager/sales-report/prediction-chart"
import { ReportTable } from "@/components/[role]/manager/sales-report/report-table"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { formatDate, formatNumber, formatRupiahInMillions } from "@/lib/format"
import { sellingReportService } from "@/services/selling-report.service"
import type { SellingReport } from "@/types/selling-report"
import { PlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const PAGE_SIZE = 20
const ALL_OPTION = "all"
const MISSING_COST_LOOKBACK_DAYS = 30

const MONTH_OPTIONS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
].map((label, index) => ({ value: String(index + 1), label }))

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => String(new Date().getFullYear() - index))

function summarizeReports(reports: SellingReport[]) {
  return reports.reduce(
    (summary, report) => ({
      totalTransactions: summary.totalTransactions + Number(report.total_transaction),
      totalItemsSold: summary.totalItemsSold + Number(report.total_items_sold),
      totalNetProfit: summary.totalNetProfit + Number(report.net_profit),
      totalCost: summary.totalCost + Number(report.unit_cost) + Number(report.operational_cost ?? 0),
    }),
    { totalTransactions: 0, totalItemsSold: 0, totalNetProfit: 0, totalCost: 0 },
  )
}

function findReportsMissingOperationalCost(reports: SellingReport[]) {
  const lookbackStart = new Date()
  lookbackStart.setDate(lookbackStart.getDate() - MISSING_COST_LOOKBACK_DAYS)
  return reports
    .filter((report) => report.operational_cost == null && new Date(report.date) >= lookbackStart)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function ManagerSalesReportPage() {
  const [reports, setReports] = useState<SellingReport[]>([])
  const [search, setSearch] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMissingCostBannerDismissed, setIsMissingCostBannerDismissed] = useState(false)
  const [reportToEditCost, setReportToEditCost] = useState<SellingReport | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchReports = useCallback(async (searchTerm: string, month: string, year: string) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const data = await sellingReportService.getAll({
        q: searchTerm || undefined,
        month: month || undefined,
        year: year || undefined,
      })
      if (isLatest()) setReports(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest()) setError("Gagal memuat laporan penjualan.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchReports(debouncedSearch, monthFilter, yearFilter)
  }, [fetchReports, debouncedSearch, monthFilter, yearFilter])

  const reloadReports = () => fetchReports(debouncedSearch, monthFilter, yearFilter)

  const handleDelete = async (report: SellingReport) => {
    await sellingReportService.remove(report.id)
    reloadReports()
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleMonthChange = (month: string) => {
    setMonthFilter(month === ALL_OPTION ? "" : month)
    setCurrentPage(1)
  }

  const handleYearChange = (year: string) => {
    setYearFilter(year === ALL_OPTION ? "" : year)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, totalPages)
  const summary = summarizeReports(reports)
  const reportsMissingCost = findReportsMissingOperationalCost(reports)
  const latestReportMissingCost = reportsMissingCost[0]

  const summaryCards = [
    { label: "Total transaksi", value: formatNumber(summary.totalTransactions) },
    { label: "Total produk terjual", value: formatNumber(summary.totalItemsSold) },
    { label: "Pendapatan bersih", value: formatRupiahInMillions(summary.totalNetProfit) },
    { label: "Modal", value: formatRupiahInMillions(summary.totalCost) },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
      <PredictionChart />
      <PredictionAccuracyChart />

      {!isMissingCostBannerDismissed && latestReportMissingCost && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            {reportsMissingCost.length} laporan belum diisi modal operasional
            <span className="text-amber-600"> (mis. {formatDate(latestReportMissingCost.date)})</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setReportToEditCost(latestReportMissingCost)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              Isi Modal
            </button>
            <button
              onClick={() => setIsMissingCostBannerDismissed(true)}
              className="text-xs text-amber-700/70 hover:text-amber-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-foreground/10 p-4">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className="font-bold text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Laporan
        </button>

        <div className="flex items-center gap-2">
          <Select value={yearFilter || ALL_OPTION} onValueChange={handleYearChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>Semua Tahun</SelectItem>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter || ALL_OPTION} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>Semua Bulan</SelectItem>
              {MONTH_OPTIONS.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari laporan ..." />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadReports} />
      ) : (
        <ReportTable
          reports={reports}
          currentPage={visiblePage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
          onEditOperationalCost={setReportToEditCost}
        />
      )}

      {isAddModalOpen && (
        <AddReportModal onCreated={reloadReports} onClose={() => setIsAddModalOpen(false)} />
      )}

      {reportToEditCost && (
        <OperationalCostModal
          report={reportToEditCost}
          onSaved={reloadReports}
          onClose={() => setReportToEditCost(null)}
        />
      )}
    </div>
  )
}
