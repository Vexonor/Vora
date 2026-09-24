import { RoleLayout, type NavItem } from "@/components/layout/role-layout"
import { BoxIcon } from "@/components/icons/box"
import { CallBellIcon } from "@/components/icons/call-bell"
import { DashboardIcon } from "@/components/icons/dashboard"
import { DocumentIcon } from "@/components/icons/document"
import { MenuIcon } from "@/components/icons/menu"
import { TableIcon } from "@/components/icons/table"
import { UsersIcon } from "@/components/icons/users"
import { ScaleIcon } from "lucide-react"

const MANAGER_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/manager/dashboard", icon: <DashboardIcon className="size-6" /> },
  { title: "Pesanan", url: "/manager/order", icon: <CallBellIcon className="size-6" /> },
  { title: "Menu", url: "/manager/menu", icon: <MenuIcon className="size-6" /> },
  { title: "Stok", url: "/manager/stock", icon: <BoxIcon className="size-6" /> },
  { title: "Satuan (Unit)", url: "/manager/unit", icon: <ScaleIcon className="size-6" /> },
  { title: "Meja Makan", url: "/manager/table-management", icon: <TableIcon className="size-6" /> },
  { title: "Staf", url: "/manager/staff", icon: <UsersIcon className="size-6" /> },
  { title: "Laporan Penjualan", url: "/manager/sales-report", icon: <DocumentIcon className="size-6" /> },
]

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout navItems={MANAGER_NAV_ITEMS}>{children}</RoleLayout>
}
