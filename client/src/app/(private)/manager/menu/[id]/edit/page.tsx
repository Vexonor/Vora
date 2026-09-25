"use client"

import { MenuForm } from "@/components/manager/menu/menu-form"
import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { useMenuDetail, useUpdateMenu } from "@/hooks/queries/use-menus"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { useRouter } from "next/navigation"
import { use } from "react"
import { toast } from "sonner"

export default function ManagerMenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const menuId = Number(use(params).id)
  const router = useRouter()
  const menuQuery = useMenuDetail(menuId)
  const updateMenu = useUpdateMenu()

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await updateMenu.mutateAsync({ menuId, formData: toMenuFormData(values, { includeStatus: true }) })
      toast.success("Menu berhasil diperbarui.")
      router.push(`/manager/menu/${menuId}`)
    } catch {
      toast.error("Gagal memperbarui menu. Silakan coba lagi.")
    }
  }

  if (menuQuery.isPending) return <PageLoader />

  if (!menuQuery.data) {
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
      <MenuForm initialMenu={menuQuery.data} onSubmit={handleSubmit} isSubmitting={updateMenu.isPending} />
    </div>
  )
}
