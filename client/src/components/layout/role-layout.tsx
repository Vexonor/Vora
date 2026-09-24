"use client"

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { formatDate } from "@/lib/format"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "./app-sidebar"

export type NavItem = {
  title: string
  url: string
  icon: React.ReactNode
}

const SUB_PAGE_TITLES: Record<string, string> = {
  create: "Tambah",
  edit: "Edit",
}

export function isNavItemActive(pathname: string, navItemUrl: string) {
  return pathname === navItemUrl || pathname.startsWith(`${navItemUrl}/`)
}

function getSubPageTitle(pathname: string) {
  const lastSegment = pathname.split("/").pop() ?? ""
  return SUB_PAGE_TITLES[lastSegment] ?? lastSegment
}

type Props = {
  navItems: NavItem[]
  children: React.ReactNode
}

export function RoleLayout({ navItems, children }: Props) {
  const pathname = usePathname()
  const [todayLabel, setTodayLabel] = useState("")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayLabel(formatDate(new Date(), "weekdayLong"))
  }, [])

  const activeNavItem = navItems.find((navItem) => isNavItemActive(pathname, navItem.url))
  const pageTitle = activeNavItem?.title ?? navItems[0]?.title ?? ""
  const isSubPage = activeNavItem ? pathname !== activeNavItem.url : false

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} />
      <SidebarInset className="flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {isSubPage && activeNavItem ? (
                    <BreadcrumbLink href={activeNavItem.url}>{pageTitle}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{getSubPageTitle(pathname)}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4 text-sm text-muted-foreground">{todayLabel}</div>
        </header>
        <main className="flex flex-1 flex-col min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
