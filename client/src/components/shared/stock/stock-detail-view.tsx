"use client"

import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/format"
import { getStockName } from "@/lib/stock"
import { getStockStatusDisplay } from "@/lib/stock-status"
import { stockService } from "@/services/stock.service"
import { unitService } from "@/services/unit.service"
import type { Stock } from "@/types/stock"
import type { Unit } from "@/types/unit"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="text-sm font-medium border border-foreground/20 rounded-lg px-3 py-2 bg-muted/20">
        {children}
      </div>
    </div>
  )
}

type Props = {
  stockId: number
  basePath: string
}

export function StockDetailView({ stockId, basePath }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStockDetail = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [stockData, unitList] = await Promise.all([
        stockService.getById(stockId),
        unitService.getAll(),
      ])
      setStock(stockData)
      setUnits(unitList)
    } catch {
      setError("Gagal memuat data bahan.")
    } finally {
      setIsLoading(false)
    }
  }, [stockId])

  useEffect(() => {
    fetchStockDetail()
  }, [fetchStockDetail])

  if (isLoading) return <PageLoader />

  if (error || !stock) {
    return (
      <LoadErrorState
        message={error ?? "Data tidak ditemukan."}
        retryLabel="Kembali"
        onRetry={() => router.push(basePath)}
      />
    )
  }

  const unitName = units.find((unit) => unit.id === stock.unit_id)?.name ?? `Unit #${stock.unit_id}`
  const statusDisplay = getStockStatusDisplay(stock.status, stock.status_name)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-2xl">
      <div className="flex items-center justify-between">
        <BackLink href={basePath} />
        <Link
          href={`${basePath}/${stock.id}/edit`}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PencilIcon className="size-4" />
          Edit Bahan
        </Link>
      </div>

      <div className="bg-white border border-foreground/10 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{getStockName(stock)}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">ID #{stock.id}</p>
          </div>
          <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} className="py-1.5 shrink-0" />
        </div>

        <hr className="border-foreground/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Jumlah Bahan">
            {stock.quantity} <span className="text-muted-foreground">{unitName}</span>
          </InfoRow>
          <InfoRow label="Satuan">{unitName}</InfoRow>
          <InfoRow label="Minimum Stok">
            {stock.minimum} <span className="text-muted-foreground">{unitName}</span>
          </InfoRow>
          <InfoRow label="Maksimum Stok">
            {stock.maximum > 0
              ? <>{stock.maximum} <span className="text-muted-foreground">{unitName}</span></>
              : <span className="text-muted-foreground">Tidak dibatasi</span>
            }
          </InfoRow>
        </div>

        <hr className="border-foreground/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Dibuat">{formatDate(stock.created_at, "weekdayLong")}</InfoRow>
          <InfoRow label="Diperbarui">{formatDate(stock.updated_at, "weekdayLong")}</InfoRow>
        </div>
      </div>
    </div>
  )
}
