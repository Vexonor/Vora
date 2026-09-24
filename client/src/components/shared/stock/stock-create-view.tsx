"use client"

import { StockForm } from "@/components/shared/stock/stock-form"
import { toStockRequest, type StockFormValues } from "@/lib/stock"
import { stockService } from "@/services/stock.service"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function StockCreateView({ basePath }: { basePath: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: StockFormValues) => {
    setIsSubmitting(true)
    try {
      await stockService.create(toStockRequest(values))
      toast.success("Bahan berhasil ditambahkan.")
      router.push(basePath)
    } catch {
      toast.error("Gagal menambahkan bahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return <StockForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
