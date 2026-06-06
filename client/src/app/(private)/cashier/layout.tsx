"use client"

import { RoleLayout } from "@/components/layout/role-layout"
import { useAuth } from "@/hooks/use-auth"
import { CallBellIcon } from "@icons/call-bell"
import { DashboardIcon } from "@icons/dashboard"
import { PlusIcon } from "@icons/plus"
import { usePathname } from "next/navigation"

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

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
    {
      title: "Buat Pesanan",
      url: "/cashier/create-order",
      icon: <PlusIcon className="size-6" />,
      isActive: pathname === "/cashier/create-order",
    },
  ]

  const cashierUser = {
    name: user?.username ?? "Kasir Utama",
    email: user?.email ?? "cashier@vora.com",
    avatar: "/avatars/cashier.jpg",
  }

  return (
    <RoleLayout user={cashierUser} navItems={cashierNav}>
      {children}
    </RoleLayout>
  )
}