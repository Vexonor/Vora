"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isNavItemActive, type NavItem } from "./role-layout"
import { SidebarUserMenu } from "./sidebar-user-menu"

export function AppSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={navItems[0]?.url ?? "/"}>
                <div className="flex items-center gap-3">
                  <Image
                    src="/image/catalog-logo.svg"
                    alt="Cat-a Log Logo"
                    width={100}
                    height={100}
                    className="size-12"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <h1 className="text-lg font-bold text-primary">Cat-a <br /> Log</h1>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarMenu>
            {navItems.map((navItem) => (
              <SidebarMenuItem key={navItem.url}>
                <SidebarMenuButton asChild isActive={isNavItemActive(pathname, navItem.url)}>
                  <Link href={navItem.url}>
                    {navItem.icon}
                    <span>{navItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
