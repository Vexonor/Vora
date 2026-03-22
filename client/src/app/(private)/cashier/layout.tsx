"use client"

import { RoleLayout } from "@/components/layout/role-layout"
import { CallBellIcon } from "@icons/call-bell"
import { DashboardIcon } from "@icons/dashboard"
import { usePathname } from "next/navigation"

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const cashierNav = [
    {
      title: "Dashboard",
      url: "/cashier/dashboard",
      icon: <DashboardIcon className="size-6" />,
      isActive: pathname === "/cashier/dashboard",
    },
    {
      title: "Pesanan",
      url: "/cashier/order",
      icon: <CallBellIcon className="size-6" />,
      isActive: pathname === "/cashier/order",
    },
  ]

  const cashierUser = {
    name: "Kasir Utama",
    email: "cashier@vora.com",
    avatar: "/avatars/cashier.jpg",
  }

  return (
    <RoleLayout user={cashierUser} navItems={cashierNav}>
      {children}
    </RoleLayout>
  )
}