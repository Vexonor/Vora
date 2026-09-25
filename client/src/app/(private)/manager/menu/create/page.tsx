"use client"

import { MenuForm } from "@/components/manager/menu/menu-form"
import { useCreateMenu } from "@/hooks/queries/use-menus"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ManagerMenuCreatePage() {
  const router = useRouter()
  const createMenu = useCreateMenu()

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await createMenu.mutateAsync(toMenuFormData(values, { includeStatus: false }))
      toast.success("Menu berhasil ditambahkan.")
      router.push("/manager/menu")
    } catch {
      toast.error("Gagal menambahkan menu. Silakan coba lagi.")
    }
  }

  return <MenuForm onSubmit={handleSubmit} isSubmitting={createMenu.isPending} />
}
