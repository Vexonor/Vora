import { TableIcon } from "@icons/table"
import { MenuIcon } from "@icons/menu"
import { ReceiptItemIcon } from "@icons/receipt-item"
import { TimerIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

export type TrendType = "up" | "down" | "neutral"

export type ManagerStat = {
  title: string
  value: number | string
  icon: React.ReactNode
  trend: TrendType
  trendIcon: React.ReactNode
  trendLabel: string
}

export const MANAGER_STATS: ManagerStat[] = [
  {
    title: "Manajemen Meja",
    value: 15,
    icon: <TableIcon className="size-full text-primary" />,
    trend: "neutral",
    trendIcon: <TimerIcon className="size-4 text-secondary" />,
    trendLabel: "7 meja aktif",
  },
  {
    title: "Menu",
    value: 20,
    icon: <MenuIcon className="size-full text-primary" />,
    trend: "up",
    trendIcon: <TrendingUpIcon className="size-4 text-success" />,
    trendLabel: "+10 menu ditambahkan",
  },
  {
    title: "Pesanan",
    value: 122,
    icon: <ReceiptItemIcon className="size-full text-primary" />,
    trend: "down",
    trendIcon: <TrendingDownIcon className="size-4 text-error" />,
    trendLabel: "Turun 10% dari kemarin",
  },
]