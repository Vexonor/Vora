import type { StatusTone } from "@/lib/status-tone"
import { MenuStatus, MenuType } from "@/types/menu"

const MENU_STATUS_DISPLAY: Record<MenuStatus, { label: string; tone: StatusTone }> = {
  [MenuStatus.AVAILABLE]: { label: "Tersedia", tone: "primary" },
  [MenuStatus.SOLD_OUT]: { label: "Habis", tone: "destructive" },
  [MenuStatus.INACTIVE]: { label: "Tidak Aktif", tone: "neutral" },
}

export function getMenuStatusDisplay(status: number, fallbackLabel = "Unknown") {
  return MENU_STATUS_DISPLAY[status as MenuStatus] ?? { label: fallbackLabel, tone: "neutral" as const }
}

export const MENU_STATUS_OPTIONS = [MenuStatus.AVAILABLE, MenuStatus.SOLD_OUT, MenuStatus.INACTIVE].map((status) => ({
  value: status,
  ...MENU_STATUS_DISPLAY[status],
}))

export const MENU_TYPE_OPTIONS = [
  { value: MenuType.FOOD, label: "Makanan" },
  { value: MenuType.HOT_DRINK, label: "Minuman Panas" },
  { value: MenuType.COLD_DRINK, label: "Minuman Dingin" },
  { value: MenuType.SNACK, label: "Cemilan" },
]

export const MENU_IMAGE_PLACEHOLDER = "/image/menu/nasi-goreng.jpg"
