"use client"

import { RoleLayout } from "@/components/layout/role-layout"
import { useAuth } from "@/hooks/use-auth"
import { BoxIcon } from "@icons/box"
import { CallBellIcon } from "@icons/call-bell"
import { usePathname } from "next/navigation"

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const kitchenNav = [
    {
      title: "Pesanan",
      url: "/kitchen/order",
      icon: <CallBellIcon className="size-6" />,
      isActive: pathname === "/kitchen/order",
    },
    {
      title: "Stok Bahan",
      url: "/kitchen/stock",
      icon: <BoxIcon className="size-6" />,
      isActive: pathname.startsWith("/kitchen/stock"),
    },
  ]

  const kitchenUser = {
    name: user?.username ?? "Dapur Utama",
    email: user?.email ?? "kitchen@vora.com",
    avatar: "/avatars/kitchen.jpg",
  }

  return (
    <RoleLayout user={kitchenUser} navItems={kitchenNav}>
      {children}
    </RoleLayout>
  )
}