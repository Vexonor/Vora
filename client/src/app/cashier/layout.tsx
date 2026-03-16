/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CallBellIcon } from "@icons/call-bell";
import { DashboardIcon } from "@icons/dashboard";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function CashierLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const [date, setDate] = useState("")

  useEffect(() => {
    setDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }))
  }, [])

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
    }
  ]

  const pageTitle = cashierNav.find((nav) => pathname === nav.url)?.title ?? "Dashboard"

  const cashierUser = {
    name: "Kasir Utama",
    email: "cashier@vora.com",
    avatar: "/avatars/cashier.jpg",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={cashierUser} navItems={cashierNav} />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    {pageTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto px-4 text-sm text-muted-foreground">
            {date}
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}