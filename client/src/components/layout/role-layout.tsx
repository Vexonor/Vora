/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type NavItem = {
  title: string
  url: string
  icon: React.ReactNode
  isActive?: boolean
}

type User = {
  name: string
  email: string
  avatar: string
}

type Props = {
  user: User
  navItems: NavItem[]
  children: React.ReactNode
}

export function RoleLayout({ user, navItems, children }: Props) {
  const pathname = usePathname()
  const [date, setDate] = useState("")

  useEffect(() => {
    setDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }))
  }, [])

  const activeNav = navItems.find((nav) => pathname.startsWith(nav.url))
  const pageTitle = activeNav?.title ?? navItems[0]?.title ?? ""

  const isSubPage = activeNav ? pathname !== activeNav.url : false

  const getSubPageTitle = () => {
    const segments = pathname.split("/")
    const last = segments[segments.length - 1]
    const subPageTitles: Record<string, string> = {
      create: "Tambah",
      edit: "Edit",
      detail: "Detail",
    }
    return subPageTitles[last] ?? last
  }

  return (
    <SidebarProvider>
      <AppSidebar avatar={user.avatar} navItems={navItems} />
      <SidebarInset className="flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {isSubPage ? (
                    <BreadcrumbLink href={activeNav?.url ?? "#"}>
                      {pageTitle}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{getSubPageTitle()}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4 text-sm text-muted-foreground">{date}</div>
        </header>
        <main className="flex flex-1 flex-col min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}