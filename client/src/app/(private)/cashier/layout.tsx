import { RoleLayout, type NavItem } from "@/components/layout/role-layout"
import { CallBellIcon } from "@/components/icons/call-bell"
import { DashboardIcon } from "@/components/icons/dashboard"
import { PlusIcon } from "@/components/icons/plus"

const CASHIER_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/cashier/dashboard", icon: <DashboardIcon className="size-6" /> },
  { title: "Pesanan", url: "/cashier/order", icon: <CallBellIcon className="size-6" /> },
  { title: "Buat Pesanan", url: "/cashier/create-order", icon: <PlusIcon className="size-6" /> },
]

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout navItems={CASHIER_NAV_ITEMS}>{children}</RoleLayout>
}
