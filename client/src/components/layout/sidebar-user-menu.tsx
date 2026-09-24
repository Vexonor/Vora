"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { ChevronsUpDown, KeyRound, LogOut, UserRound } from "lucide-react"
import { useState } from "react"
import { ProfileModal, type ProfileTab } from "./profile-modal"

export function SidebarUserMenu() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const [openProfileTab, setOpenProfileTab] = useState<ProfileTab | null>(null)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  if (!user) return null

  const initials = user.username.charAt(0).toUpperCase()
  const avatarUrl = user.avatar_url || undefined

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={user.username} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarUrl} alt={user.username} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.username}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpenProfileTab("info")}>
                  <UserRound className="size-4" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenProfileTab("password")}>
                  <KeyRound className="size-4" />
                  Ganti Password
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {openProfileTab && (
        <ProfileModal
          user={user}
          initialTab={openProfileTab}
          onClose={() => setOpenProfileTab(null)}
        />
      )}

      <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Keluar</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar? Sesi Anda akan diakhiri.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsLogoutConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={logout}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <LogOut className="size-4 mr-1" />
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
