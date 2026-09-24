"use client"

import { MenuForm } from "@/components/manager/menu/menu-form"
import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagerMenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const menuId = Number(use(params).id)
  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    menuService.getById(menuId)
      .then(setMenu)
      .catch(() => setMenu(null))
      .finally(() => setIsLoading(false))
  }, [menuId])

  const handleSubmit = async (values: MenuFormValues) => {
    setIsSubmitting(true)
    try {
      await menuService.update(menuId, toMenuFormData(values, { includeStatus: true }))
      toast.success("Menu berhasil diperbarui.")
      router.push(`/manager/menu/${menuId}`)
    } catch {
      toast.error("Gagal memperbarui menu. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <BackLink href={`/manager/menu/${menuId}`} label="Batal" />
      </div>
      <MenuForm initialMenu={menu} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
