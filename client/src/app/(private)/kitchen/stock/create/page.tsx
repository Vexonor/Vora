"use client"

import { CreateStockForm, StockForm } from "@/components/shared/stock/create-stock-form"
import { stockService } from "@/services/stock.service"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function KitchenCreateStockPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (form: StockForm) => {
    setIsSubmitting(true)
    try {
      await stockService.create({
        name: form.name,
        unit_id: Number(form.unit || 1),
        quantity: Number(form.quantity),
        minimum: Number(form.minStock || 0),
        maximum: Number(form.maxStock || 0),
      })
      toast.success("Bahan berhasil ditambahkan.")
      router.refresh()
      router.push("/kitchen/stock")
    } catch {
      toast.error("Gagal menambahkan bahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return <CreateStockForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
