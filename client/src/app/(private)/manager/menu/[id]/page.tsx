"use client"

import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatRupiah } from "@/lib/format"
import { getMenuStatusDisplay } from "@/lib/menu-status"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { PencilIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"

export default function ManagerMenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const menuId = Number(use(params).id)
  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    menuService.getById(menuId)
      .then(setMenu)
      .catch(() => setMenu(null))
      .finally(() => setIsLoading(false))
  }, [menuId])

  if (isLoading) return <PageLoader />

  if (!menu) {
    return (
      <LoadErrorState
        message="Gagal memuat data menu."
        retryLabel="Kembali ke Daftar Menu"
        onRetry={() => router.push("/manager/menu")}
      />
    )
  }

  const statusDisplay = getMenuStatusDisplay(menu.status, menu.status_name)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-5xl">
      <div className="flex items-center justify-between">
        <BackLink href="/manager/menu" />
        <Link href={`/manager/menu/${menuId}/edit`} className="flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <PencilIcon className="size-4" />
          Edit Menu
        </Link>
      </div>

      <div className="bg-white border border-foreground/10 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="w-full md:w-1/2 min-h-64 bg-muted relative">
          {menu.image_url ? (
            <Image src={menu.image_url} alt={menu.name} fill className="object-cover" unoptimized />
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
              <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
            </div>
            <p className="text-muted-foreground">{menu.type_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Harga Jual</span>
              <span className="text-lg font-semibold">{formatRupiah(menu.price)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Harga Modal</span>
              <span className="text-lg font-semibold text-muted-foreground">{formatRupiah(menu.cost)}</span>
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
