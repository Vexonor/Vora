import { RoleLayout, type NavItem } from "@/components/layout/role-layout"
import { BoxIcon } from "@icons/box"
import { CallBellIcon } from "@icons/call-bell"

const KITCHEN_NAV_ITEMS: NavItem[] = [
  { title: "Pesanan", url: "/kitchen/order", icon: <CallBellIcon className="size-6" /> },
  { title: "Stok Bahan", url: "/kitchen/stock", icon: <BoxIcon className="size-6" /> },
]

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout navItems={KITCHEN_NAV_ITEMS}>{children}</RoleLayout>
}
