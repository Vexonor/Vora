"use client"

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface AppSidebarProps {
  navItems: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  userData: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Sidebar = ({ navItems, userData }: AppSidebarProps) => {
  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/image/app-logo.svg"
            alt="Vora Logo"
            width={100}
            height={100}
            className="size-10"
          />
          <h1 className="text-2xl font-bold text-primary">Vora</h1>
        </div>
      </div>

      <div className="px-4">
        <Separator />
      </div>
      {/* Nav Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <Link
              href={item.url}
              key={index}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.isActive
                ? 'bg-secondary text-primary font-semibold'
                : 'text-gray-600 hover:bg-secondary/20 hover:text-gray-900'
                }`}
            >
              <span className="shrink-0">
                {item.icon}
              </span>
              <span className="text-sm">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      {/* User Section */}
      <div className="p-4">
        <Separator />
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userData.name}</p>
            <p className="text-xs text-gray-500 truncate">{userData.email}</p>
          </div>
        </div>

        {/* Profile Button */}
        <Link
          href="/cashier/profile"
          className="block mt-4 w-full bg-primary text-white font-medium rounded-lg py-2.5 text-sm text-center hover:bg-primary/90 transition-colors"
        >
          Profile Pengguna
        </Link>

        {/* Watermark */}
        <p className="mt-4 text-xs text-gray-400 text-center">
          © 2025 Vora App
        </p>
      </div>
    </div>
  )
}

export default Sidebar;