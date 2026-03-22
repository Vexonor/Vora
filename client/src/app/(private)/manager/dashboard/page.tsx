import { MANAGER_STATS } from "@/lib/constant/manager-stats"
import { ManagerStatCard } from "../../../../components/[role]/manager/dashboard/manager-stat-card"
import { OrderBarChart } from "../../../../components/[role]/manager/dashboard/order-bar-chart"
import { RevenueBarChart } from "../../../../components/[role]/manager/dashboard/revenue-bar-chart"
import { RevenueDonutChart } from "../../../../components/[role]/manager/dashboard/revenue-donut-chart"

export default function ManagerDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {MANAGER_STATS.map((stat) => (
          <ManagerStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <RevenueDonutChart />
        <OrderBarChart />
        <RevenueBarChart />
      </div>
    </div>
  )
}