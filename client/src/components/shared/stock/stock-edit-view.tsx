"use client"

import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { StockForm } from "@/components/shared/stock/stock-form"
import { useStockDetail, useUpdateStock } from "@/hooks/queries/use-stocks"
import { toStockFormValues, toStockRequest, type StockFormValues } from "@/lib/stock"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  stockId: number
  basePath: string
}

export function StockEditView({ stockId, basePath }: Props) {
  const router = useRouter()
  const stockQuery = useStockDetail(stockId)
  const updateStock = useUpdateStock()
  const detailPath = `${basePath}/${stockId}`

  const handleSubmit = async (values: StockFormValues) => {
    try {
      await updateStock.mutateAsync({ stockId, request: toStockRequest(values) })
      toast.success("Perubahan bahan berhasil disimpan.")
      router.push(detailPath)
    } catch {
      toast.error("Gagal menyimpan perubahan. Silakan coba lagi.")
    }
  }

  if (stockQuery.isPending) return <PageLoader />

  if (!stockQuery.data) {
    return (
      <LoadErrorState message="Gagal memuat data bahan." retryLabel="Kembali" onRetry={() => router.push(basePath)} />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 pt-0">
        <BackLink href={detailPath} />
      </div>
      <StockForm
        initialValues={toStockFormValues(stockQuery.data)}
        isSubmitting={updateStock.isPending}
        submitLabel="Simpan Perubahan"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
