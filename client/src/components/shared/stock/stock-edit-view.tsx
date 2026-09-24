"use client"

import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { StockForm } from "@/components/shared/stock/stock-form"
import { toStockFormValues, toStockRequest, type StockFormValues } from "@/lib/stock"
import { stockService } from "@/services/stock.service"
import type { Stock } from "@/types/stock"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

type Props = {
  stockId: number
  basePath: string
}

export function StockEditView({ stockId, basePath }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const detailPath = `${basePath}/${stockId}`

  const fetchStock = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      setStock(await stockService.getById(stockId))
    } catch {
      setLoadError("Gagal memuat data bahan.")
    } finally {
      setIsLoading(false)
    }
  }, [stockId])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const handleSubmit = async (values: StockFormValues) => {
    setIsSubmitting(true)
    try {
      await stockService.update(stockId, toStockRequest(values))
      toast.success("Perubahan bahan berhasil disimpan.")
      router.push(detailPath)
    } catch {
      toast.error("Gagal menyimpan perubahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageLoader />

  if (!stock) {
    return (
      <LoadErrorState
        message={loadError ?? "Data tidak ditemukan."}
        retryLabel="Kembali"
        onRetry={() => router.push(basePath)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 pt-0">
        <BackLink href={detailPath} />
      </div>
      <StockForm
        initialValues={toStockFormValues(stock)}
        isSubmitting={isSubmitting}
        submitLabel="Simpan Perubahan"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
