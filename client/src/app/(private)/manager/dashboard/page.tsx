"use client"

import { ManagerStatCard } from "../../../../components/[role]/manager/dashboard/manager-stat-card"
import { OrderBarChart } from "../../../../components/[role]/manager/dashboard/order-bar-chart"
import { RevenueBarChart } from "../../../../components/[role]/manager/dashboard/revenue-bar-chart"
import { RevenueDonutChart } from "../../../../components/[role]/manager/dashboard/revenue-donut-chart"
import { dashboardService } from "@/services/dashboard.service"
import type { ChartPeriod, ManagerChartData } from "@/types/dashboard"
import { TableIcon } from "@icons/table"
import { MenuIcon } from "@icons/menu"
import { ReceiptItemIcon } from "@icons/receipt-item"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type ManagerStat = {
  title: string
  value: number | string
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
  trendIcon: React.ReactNode
  trendLabel: string
}

const PERIODS: { value: ChartPeriod; label: string; description: string }[] = [
  { value: "7d", label: "7 Hari", description: "7 hari terakhir" },
  { value: "30d", label: "30 Hari", description: "30 hari terakhir" },
  { value: "6m", label: "6 Bulan", description: "6 bulan terakhir" },
]

const EMPTY_CHART: ManagerChartData = {
  orders: { chart: [], totalInPeriod: 0, todayCount: 0 },
  revenue: { chart: [], totalInPeriod: 0, todayRevenue: 0, completed: 0, canceled: 0 },
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<ManagerStat[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [chartData, setChartData] = useState<ManagerChartData>(EMPTY_CHART)
  const [isLoadingChart, setIsLoadingChart] = useState(true)
  const [period, setPeriod] = useState<ChartPeriod>("7d")

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const data = await dashboardService.getManagerStats()
      const { menuCount, orderCount, tableCount } = data
      setStats([
        {
          title: "Manajemen Meja",
          value: tableCount,
          icon: <TableIcon className="size-full text-primary" />,
          trend: "neutral",
          trendIcon: <></>,
          trendLabel: `${tableCount} meja terdaftar`,
        },
        {
          title: "Menu",
          value: menuCount,
          icon: <MenuIcon className="size-full text-primary" />,
          trend: "neutral",
          trendIcon: <></>,
          trendLabel: `${menuCount} menu tersedia`,
        },
        {
          title: "Pesanan",
          value: orderCount,
          icon: <ReceiptItemIcon className="size-full text-primary" />,
          trend: "neutral",
          trendIcon: <></>,
          trendLabel: `${orderCount} total pesanan`,
        },
      ])
    } catch {
      setStats([])
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  const fetchChartData = useCallback(async (p: ChartPeriod) => {
    setIsLoadingChart(true)
    try {
      const data = await dashboardService.getManagerChartData(p)
      setChartData(data)
    } catch {
      setChartData(EMPTY_CHART)
    } finally {
      setIsLoadingChart(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchChartData(period)
  }, [period, fetchChartData])

  const periodLabel = PERIODS.find((p) => p.value === period)?.description ?? ""

  if (isLoadingStats) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {stats.map((stat) => (
          <ManagerStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Period toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p.value
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RevenueDonutChart
          completed={chartData.revenue.completed}
          canceled={chartData.revenue.canceled}
          periodLabel={periodLabel}
          isLoading={isLoadingChart}
        />
        <OrderBarChart
          data={chartData.orders.chart}
          totalInPeriod={chartData.orders.totalInPeriod}
          todayCount={chartData.orders.todayCount}
          periodLabel={periodLabel}
          isLoading={isLoadingChart}
        />
        <RevenueBarChart
          data={chartData.revenue.chart}
          totalInPeriod={chartData.revenue.totalInPeriod}
          todayRevenue={chartData.revenue.todayRevenue}
          periodLabel={periodLabel}
          isLoading={isLoadingChart}
        />
      </div>
    </div>
  )
}
