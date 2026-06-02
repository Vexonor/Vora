"use client"

import { RoleLayout } from "@/components/layout/role-layout"
import { useAuth } from "@/hooks/use-auth"
import { BoxIcon } from "@icons/box"
import { CallBellIcon } from "@icons/call-bell"
import { DashboardIcon } from "@icons/dashboard"
import { DocumentIcon } from "@icons/document"
import { MenuIcon } from "@icons/menu"
import { TableIcon } from "@icons/table"
import { UsersIcon } from "@icons/users"
import { usePathname } from "next/navigation"
import { ScaleIcon } from "lucide-react"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const managerNav = [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: <DashboardIcon className="size-6" />,
      isActive: pathname === "/manager/dashboard",
    },
    {
      title: "Pesanan",
      url: "/manager/order",
      icon: <CallBellIcon className="size-6" />,
      isActive: pathname === "/manager/order",
    },
    {
      title: "Menu",
      url: "/manager/menu",
      icon: <MenuIcon className="size-6" />,
      isActive: pathname.startsWith("/manager/menu"),
    },
    {
      title: "Stok",
      url: "/manager/stock",
      icon: <BoxIcon className="size-6" />,
      isActive: pathname.startsWith("/manager/stock"),
    },
    {
      title: "Satuan (Unit)",
      url: "/manager/unit",
      icon: <ScaleIcon className="size-6" />,
      isActive: pathname.startsWith("/manager/unit"),
    },
    {
      title: "Meja Makan",
      url: "/manager/table-management",
      icon: <TableIcon className="size-6" />,
      isActive: pathname === "/manager/table-management",
    },
    {
      title: "Staf",
      url: "/manager/staff",
      icon: <UsersIcon className="size-6" />,
      isActive: pathname === "/manager/staff",
    },
    {
      title: "Laporan Penjualan",
      url: "/manager/sales-report",
      icon: <DocumentIcon className="size-6" />,
      isActive: pathname === "/manager/sales-report",
    },
  ]

  const managerUser = {
    name: user?.username ?? "Manajer",
    email: user?.email ?? "manager@vora.com",
    avatar: "/avatars/manager.jpg",
  }

  return (
    <RoleLayout user={managerUser} navItems={managerNav}>
      {children}
    </RoleLayout>
  )
}