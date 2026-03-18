/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { BoxIcon } from "@icons/box"
import { CallBellIcon } from "@icons/call-bell"
import { MenuIcon } from "@icons/menu"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [date, setDate] = useState("")

  useEffect(() => {
    setDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }))
  }, [])

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
      isActive: pathname === "/kitchen/stock",
    },
    {
      title: "Menu",
      url: "/kitchen/menu",
      icon: <MenuIcon className="size-6" />,
      isActive: pathname === "/kitchen/menu",
    },
  ]

  const kitchenUser = {
    name: "Dapur Utama",
    email: "kitchen@vora.com",
    avatar: "/avatars/kitchen.jpg",
  }

  const pageTitle = kitchenNav.find((nav) => pathname === nav.url)?.title ?? "Pesanan"

  return (
    <SidebarProvider>
      <AppSidebar user={kitchenUser} navItems={kitchenNav} />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{pageTitle}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4 text-sm text-muted-foreground">{date}</div>
        </header>
        <main className="flex flex-1 flex-col overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}