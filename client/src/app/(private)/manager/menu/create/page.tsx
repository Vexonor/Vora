"use client"

import { MenuForm, MenuFormData } from "@/components/[role]/manager/menu/menu-form"
import { menuService } from "@/services/menu.service"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ManagerCreateMenuPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (form: MenuFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("price", String(form.price))
      formData.append("cost", String(form.cost ?? 0))
      formData.append("type", String(form.type))
      if (form.description) formData.append("description", form.description)
      if (form.image) formData.append("image", form.image)

      await menuService.create(formData)
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
