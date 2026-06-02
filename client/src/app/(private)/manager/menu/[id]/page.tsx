"use client"

import { Menu } from "@/types/menu"
import { menuService } from "@/services/menu.service"
import { ChevronLeftIcon, Loader2Icon, PencilIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { MENU_STATUS_BADGE } from "@/components/[role]/manager/menu/menu-table"

export default function ManagerMenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = Number(resolvedParams.id)
  
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await menuService.getById(id)
        setMenu(data)
      } catch {
        setError("Gagal memuat data menu.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenu()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-destructive font-medium">{error || "Menu tidak ditemukan"}</p>
        <Link href="/manager/menu" className="text-primary hover:underline text-sm font-medium">
          Kembali ke Daftar Menu
        </Link>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const statusConfig = MENU_STATUS_BADGE[menu.status] ?? { label: menu.status_name, badgeClass: "border-foreground/30 bg-foreground/5 text-foreground" }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link href="/manager/menu" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ChevronLeftIcon className="size-4" />
          Kembali
        </Link>
        <Link href={`/manager/menu/${id}/edit`} className="flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <PencilIcon className="size-4" />
          Edit Menu
        </Link>
      </div>

      <div className="bg-white border border-foreground/10 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="w-full md:w-1/2 min-h-64 bg-muted relative">
          {menu.image_url ? (
            <Image
              src={menu.image_url}
              alt={menu.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Tidak ada foto
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{menu.name}</h1>
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusConfig.badgeClass}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-muted-foreground">{menu.type_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Harga Jual</span>
              <span className="text-lg font-semibold">{formatCurrency(menu.price)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Harga Modal</span>
              <span className="text-lg font-semibold text-muted-foreground">{formatCurrency(menu.cost)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">Deskripsi</span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {menu.description || "Tidak ada deskripsi."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
