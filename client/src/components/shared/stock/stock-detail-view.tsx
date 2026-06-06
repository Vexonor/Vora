"use client"

import { stockService } from "@/services/stock.service"
import { unitService } from "@/services/unit.service"
import type { Stock } from "@/types/stock"
import { StockStatus } from "@/types/stock"
import type { Unit } from "@/types/unit"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const STOCK_STATUS_BADGE: Record<number, { label: string; badgeClass: string }> = {
  [StockStatus.IN_STOCK]: { label: "Tersedia", badgeClass: "border-primary/40 bg-primary/10 text-primary" },
  [StockStatus.LOW_STOCK]: { label: "Menipis", badgeClass: "border-amber-500/40 bg-amber-50 text-amber-600" },
  [StockStatus.OUT_OF_STOCK]: { label: "Habis", badgeClass: "border-destructive/40 bg-destructive/10 text-destructive" },
  [StockStatus.DISCONTINUED]: { label: "Tidak Aktif", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground/60" },
  [StockStatus.ON_ORDER]: { label: "Menunggu Supplier", badgeClass: "border-blue-500/40 bg-blue-50 text-blue-600" },
}

type Props = {
  id: number
  backPath: string
  editPath: string
}

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

export function StockDetailView({ id, backPath, editPath }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [stockData, unitsData] = await Promise.all([
        stockService.getById(id),
        unitService.getAll(),
      ])
      setStock(stockData)
      setUnits(unitsData)
    } catch {
      setError("Gagal memuat data bahan.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const unitName = stock
    ? (units.find((u) => u.id === stock.unit_id)?.name ?? `Unit #${stock.unit_id}`)
    : ""

  const statusConfig = stock
    ? (STOCK_STATUS_BADGE[stock.status] ?? { label: stock.status_name ?? "Unknown", badgeClass: "border-foreground/30 bg-foreground/5 text-foreground" })
    : null

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
        <p className="text-sm text-destructive">{error ?? "Data tidak ditemukan."}</p>
        <button onClick={() => router.push(backPath)} className="text-sm text-primary underline">
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-2xl">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(backPath)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali
        </button>
        <button
          onClick={() => router.push(editPath)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PencilIcon className="size-4" />
          Edit Bahan
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-foreground/10 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{stock.name ?? `Bahan #${stock.id}`}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">ID #{stock.id}</p>
          </div>
          {statusConfig && (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          )}
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
          <InfoRow label="Dibuat">{formatDate(stock.created_at)}</InfoRow>
          <InfoRow label="Diperbarui">{formatDate(stock.updated_at)}</InfoRow>
        </div>
      </div>
    </div>
  )
}
