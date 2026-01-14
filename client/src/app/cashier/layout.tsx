"use client"

import Sidebar from "@/components/sidebar";
import { CallBellIcon } from "@icons/call-bell";
import { DashboardIcon } from "@icons/dashboard";
import { usePathname } from "next/navigation";

export default function CashierLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()

  const cashierNav = [
    {
      title: "Dashboard",
      url: "/cashier/dashboard",
      icon: <DashboardIcon className="size-6" />,
      isActive: true,
    },
    {
      title: "Pesanan",
      url: "/cashier/transactions",
      icon: <CallBellIcon className="size-6" />,
    }
  ]

  const activeNav = cashierNav.find((nav) => pathname === nav.url)
  const pageTitle = activeNav?.title || cashierNav[0]?.title || "Dashboard"

  const cashierUser = {
    name: "Kasir Utama",
    email: "cashier@vora.com",
    avatar: "/avatars/cashier.jpg",
  }

  const getFormattedDate = () => {
    const now = new Date()
    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  }
  const date = getFormattedDate()

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex h-dvh">
        {/* Side Bar */}
        <div className="w-64 xl:w-72 2xl:w-80 shrink-0">
          <Sidebar navItems={cashierNav} userData={cashierUser} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Header */}
          <div className="w-full h-20 flex items-start justify-between py-2">
            <h3 className="text-3xl font-bold">{pageTitle}</h3>
            <span className="text-lg">{date}</span>
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}