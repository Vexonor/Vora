"use client"

import { ManagerStatCard } from "@/components/manager/dashboard/manager-stat-card"
import { OrderBarChart } from "@/components/manager/dashboard/order-bar-chart"
import { RevenueBarChart } from "@/components/manager/dashboard/revenue-bar-chart"
import { RevenueDonutChart } from "@/components/manager/dashboard/revenue-donut-chart"
import { PageLoader } from "@/components/shared/page-state"
import { useManagerChart, useManagerStats } from "@/hooks/queries/use-dashboard"
import type { ChartPeriod, ManagerChartData } from "@/types/dashboard"
import { MenuIcon } from "@/components/icons/menu"
import { ReceiptItemIcon } from "@/components/icons/receipt-item"
import { TableIcon } from "@/components/icons/table"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const CHART_PERIOD_OPTIONS: { value: ChartPeriod; label: string; description: string }[] = [
  { value: "7d", label: "7 Hari", description: "7 hari terakhir" },
  { value: "30d", label: "30 Hari", description: "30 hari terakhir" },
  { value: "6m", label: "6 Bulan", description: "6 bulan terakhir" },
]

const EMPTY_CHART_DATA: ManagerChartData = {
  orders: { chart: [], totalInPeriod: 0, todayCount: 0 },
  revenue: { chart: [], totalInPeriod: 0, todayRevenue: 0, completed: 0, canceled: 0 },
}

export default function ManagerDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("7d")
  const statsQuery = useManagerStats()
  const chartQuery = useManagerChart(chartPeriod)
  const stats = statsQuery.data ?? null
  const chartData = chartQuery.data ?? EMPTY_CHART_DATA
  const isLoadingChart = chartQuery.isPending

  useEffect(() => {
    if (statsQuery.isError) toast.error("Gagal memuat statistik dashboard.")
  }, [statsQuery.isError])

  const periodDescription = CHART_PERIOD_OPTIONS.find((option) => option.value === chartPeriod)?.description ?? ""

  if (statsQuery.isPending) return <PageLoader />

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {stats && (
        <div className="grid auto-rows-min gap-4 sm:grid-cols-1 lg:grid-cols-3">
          <ManagerStatCard
            title="Manajemen Meja"
            value={stats.tableCount}
            icon={<TableIcon className="size-full text-primary" />}
            caption={`${stats.tableCount} meja terdaftar`}
          />
          <ManagerStatCard
            title="Menu"
            value={stats.menuCount}
            icon={<MenuIcon className="size-full text-primary" />}
            caption={`${stats.menuCount} menu tersedia`}
          />
          <ManagerStatCard
            title="Pesanan"
            value={stats.orderCount}
            icon={<ReceiptItemIcon className="size-full text-primary" />}
            caption={`${stats.orderCount} total pesanan`}
          />
        </div>
      )}

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {CHART_PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setChartPeriod(option.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartPeriod === option.value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RevenueDonutChart
          completedRevenue={chartData.revenue.completed}
          canceledRevenue={chartData.revenue.canceled}
          periodDescription={periodDescription}
          isLoading={isLoadingChart}
        />
        <OrderBarChart
          data={chartData.orders.chart}
          totalInPeriod={chartData.orders.totalInPeriod}
          todayCount={chartData.orders.todayCount}
          periodDescription={periodDescription}
          isLoading={isLoadingChart}
        />
        <RevenueBarChart
          data={chartData.revenue.chart}
          totalInPeriod={chartData.revenue.totalInPeriod}
          todayRevenue={chartData.revenue.todayRevenue}
          periodDescription={periodDescription}
          isLoading={isLoadingChart}
        />
      </div>
    </div>
  )
}
