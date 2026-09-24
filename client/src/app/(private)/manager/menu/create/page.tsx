"use client"

import { MenuForm } from "@/components/[role]/manager/menu/menu-form"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { menuService } from "@/services/menu.service"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ManagerMenuCreatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: MenuFormValues) => {
    setIsSubmitting(true)
    try {
      await menuService.create(toMenuFormData(values, { includeStatus: false }))
      toast.success("Menu berhasil ditambahkan.")
      router.push("/manager/menu")
    } catch {
      toast.error("Gagal menambahkan menu. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return <MenuForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
