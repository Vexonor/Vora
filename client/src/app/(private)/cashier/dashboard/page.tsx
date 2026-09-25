"use client"

import { PageLoader } from "@/components/shared/page-state"
import { useCashierStats } from "@/hooks/queries/use-dashboard"
import type { CashierDashboardStats } from "@/types/dashboard"
import { BellRingingIcon } from "@/components/icons/bell-ringing"
import { ReceiptItemIcon } from "@/components/icons/receipt-item"
import { TimerIcon } from "@/components/icons/timer"
import { useEffect } from "react"
import { toast } from "sonner"
import { ActiveOrderList } from "./components/active-order-list"
import { CashierStatCard } from "./components/cashier-stat-card"
import { PendingPaymentList } from "./components/pending-payment-list"

const EMPTY_STATS: CashierDashboardStats = { newOrders: 0, processingOrders: 0, totalOrders: 0 }

export default function CashierDashboardPage() {
  const statsQuery = useCashierStats()
  const stats = statsQuery.data ?? EMPTY_STATS

  useEffect(() => {
    if (statsQuery.isError) toast.error("Gagal memuat statistik dashboard.")
  }, [statsQuery.isError])

  if (statsQuery.isPending) return <PageLoader />

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        <CashierStatCard
          title="Pesanan Baru"
          value={stats.newOrders}
          icon={<BellRingingIcon className="size-full" />}
          isHighlighted
          iconBackgroundClass="bg-white"
          iconColorClass="text-primary"
        />
        <CashierStatCard
          title="Total Pesanan"
          value={stats.totalOrders}
          icon={<ReceiptItemIcon className="size-full" />}
          iconBackgroundClass="bg-primary/20"
          iconColorClass="text-primary"
        />
        <CashierStatCard
          title="Sedang Diproses"
          value={stats.processingOrders}
          icon={<TimerIcon className="size-full" />}
          iconBackgroundClass="bg-secondary/20"
          iconColorClass="text-secondary"
        />
      </div>

      <div className="min-h-dvh flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl md:min-h-min">
        <ActiveOrderList />
        <PendingPaymentList />
      </div>
    </div>
  )
}
