"use client"

import { CreateStockForm, type StockForm } from "@/components/shared/stock/create-stock-form"
import { stockService } from "@/services/stock.service"
import type { Stock } from "@/types/stock"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

type Props = {
  id: number
  backPath: string
}

export function StockEditView({ id, backPath }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await stockService.getById(id)
      setStock(data)
    } catch {
      setError("Gagal memuat data bahan.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const handleSubmit = async (form: StockForm) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await stockService.update(id, {
        name: form.name,
        unit_id: Number(form.unit),
        quantity: Number(form.quantity),
        minimum: Number(form.minStock || 0),
        maximum: Number(form.maxStock || 0),
      })
      router.refresh()
      router.push(backPath)
    } catch {
      setError("Gagal menyimpan perubahan. Silakan coba lagi.")
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

  if (!stock) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
        <p className="text-sm text-destructive">{error ?? "Data tidak ditemukan."}</p>
        <button onClick={() => router.push(backPath)} className="text-sm text-primary underline">
          Kembali
        </button>
      </div>
    )
  }

  const initialValues: StockForm = {
    name: stock.name ?? "",
    quantity: String(stock.quantity),
    unit: String(stock.unit_id),
    minStock: String(stock.minimum),
    maxStock: String(stock.maximum),
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 pt-0">
        <button
          onClick={() => router.push(backPath)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali
        </button>
      </div>

      {error && (
        <div className="mx-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <CreateStockForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialValues={initialValues}
        submitLabel="Simpan Perubahan"
      />
    </div>
  )
}
