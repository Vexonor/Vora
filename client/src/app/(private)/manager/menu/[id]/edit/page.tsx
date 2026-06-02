"use client"

import { MenuForm, MenuFormData } from "@/components/[role]/manager/menu/menu-form"
import { menuService } from "@/services/menu.service"
import { Menu } from "@/types/menu"
import { ChevronLeftIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

export default function ManagerEditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = Number(resolvedParams.id)

  const router = useRouter()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    menuService.getById(id)
      .then(setMenu)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSubmit = async (form: MenuFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("price", String(form.price))
      formData.append("cost", String(form.cost ?? 0))
      formData.append("type", String(form.type))
      if (form.status) formData.append("status", String(form.status))
      if (form.description) formData.append("description", form.description)
      if (form.image) formData.append("image", form.image)

      await menuService.update(id, formData)
      toast.success("Menu berhasil diperbarui.")
      router.push(`/manager/menu/${id}`)
    } catch {
      toast.error("Gagal memperbarui menu. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-destructive font-medium">Gagal memuat data menu.</p>
        <Link href="/manager/menu" className="text-primary hover:underline text-sm font-medium">
          Kembali ke Daftar Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/manager/menu/${id}`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit px-4">
        <ChevronLeftIcon className="size-4" />
        Batal
      </Link>
      <MenuForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialData={menu!} />
    </div>
  )
}
