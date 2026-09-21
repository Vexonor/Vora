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

export function AppSidebar({ avatar, navItems, ...props }: React.ComponentProps<typeof Sidebar> & {
  avatar: string
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
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems navs={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser avatar={avatar} />
      </SidebarFooter>
    </Sidebar>
  )
}
