"use client"

import { dashboardService } from "@/services/dashboard.service"
import type { CashierDashboardStats } from "@/types/dashboard"
import { BellRingingIcon } from "@icons/bell-ringing"
import { ReceiptItemIcon } from "@icons/receipt-item"
import TimerIcon from "@icons/timer"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { OrderList } from "./components/order-list"
import { PaymentList } from "./components/payment-list"
import StatCard from "./components/stat-card"

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<CashierDashboardStats>({
    newOrders: 0,
    processingOrders: 0,
    totalOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await dashboardService.getCashierStats()
      setStatsData(data)
    } catch {
      // Fallback to 0 if error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleRefresh = useCallback(() => {
    fetchStats()
    setRefreshKey((k) => k + 1)
  }, [fetchStats])

  const { newOrders, processingOrders, totalOrders } = statsData

  const stats = [
    {
      title: "Pesanan Baru",
      value: newOrders,
      icon: <BellRingingIcon className="size-full" />,
      variant: "primary" as const,
      iconBg: "bg-white",
      iconColor: "text-primary",
    },
    {
      title: "Total Pesanan",
      value: totalOrders,
      icon: <ReceiptItemIcon className="size-full" />,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Sedang Diproses",
      value: processingOrders,
      icon: <TimerIcon className="size-full" />,
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="min-h-dvh flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl md:min-h-min">
        <OrderList refreshKey={refreshKey} />
        <PaymentList refreshKey={refreshKey} onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
