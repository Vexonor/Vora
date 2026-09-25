"use client"

import { StockForm } from "@/components/shared/stock/stock-form"
import { useCreateStock } from "@/hooks/queries/use-stocks"
import { toStockRequest, type StockFormValues } from "@/lib/stock"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function StockCreateView({ basePath }: { basePath: string }) {
  const router = useRouter()
  const createStock = useCreateStock()

  const handleSubmit = async (values: StockFormValues) => {
    try {
      await createStock.mutateAsync(toStockRequest(values))
      toast.success("Bahan berhasil ditambahkan.")
      router.push(basePath)
    } catch {
      toast.error("Gagal menambahkan bahan. Silakan coba lagi.")
    }
  }

  return <StockForm onSubmit={handleSubmit} isSubmitting={createStock.isPending} />
}
