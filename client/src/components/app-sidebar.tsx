"use client"

import * as React from "react"

import { NavItems } from "@/components/nav-items"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function AppSidebar({ user, navItems,
  ...props }: React.ComponentProps<typeof Sidebar> & {
    user: { name: string; email: string; avatar: string },
    navItems: { title: string; url: string; icon: React.ReactNode; isActive?: boolean }[]
  }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex items-center gap-3">
                  <Image
                    src="/image/app-logo.svg"
                    alt="Vora Logo"
                    width={100}
                    height={100}
                    className="size-10"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <h1 className="text-2xl font-bold text-primary truncate">Vora</h1>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems navs={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
