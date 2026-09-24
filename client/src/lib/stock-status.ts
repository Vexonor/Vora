import type { StatusTone } from "@/lib/status-tone"
import { StockStatus } from "@/types/stock"

const STOCK_STATUS_DISPLAY: Record<StockStatus, { label: string; tone: StatusTone }> = {
  [StockStatus.IN_STOCK]: { label: "Tersedia", tone: "primary" },
  [StockStatus.LOW_STOCK]: { label: "Menipis", tone: "warning" },
  [StockStatus.OUT_OF_STOCK]: { label: "Habis", tone: "destructive" },
  [StockStatus.DISCONTINUED]: { label: "Tidak Aktif", tone: "neutral" },
  [StockStatus.ON_ORDER]: { label: "Menunggu Supplier", tone: "info" },
}

export function getStockStatusDisplay(status: number, fallbackLabel = "Unknown") {
  return STOCK_STATUS_DISPLAY[status as StockStatus] ?? { label: fallbackLabel, tone: "neutral" as const }
}

export const STOCK_STATUS_OPTIONS = [
  StockStatus.IN_STOCK,
  StockStatus.LOW_STOCK,
  StockStatus.OUT_OF_STOCK,
  StockStatus.DISCONTINUED,
  StockStatus.ON_ORDER,
].map((status) => ({ value: status, ...STOCK_STATUS_DISPLAY[status] }))
