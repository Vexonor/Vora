import { STATS } from "@/lib/constant/stat-cards";
import { OrderList } from "./components/order-list";
import { PaymentList } from "./components/payment-list";
import StatCard from "./components/stat-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="min-h-dvh flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl md:min-h-min">
        <OrderList />
        <PaymentList />
      </div>
    </div>
  )
}