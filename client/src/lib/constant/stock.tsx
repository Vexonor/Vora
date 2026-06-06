export type StockStatus = "tersedia" | "habis" | "hampir_habis"

export type Stock = {
  id: string
  name: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  image?: string
  status: StockStatus
}

export const STOCK_STATUS_CONFIG: Record<StockStatus, {
  label: string
  badgeClass: string
}> = {
  tersedia: {
    label: "Tersedia",
    badgeClass: "border border-primary text-primary bg-primary/10",
  },
  habis: {
    label: "Habis",
    badgeClass: "border border-destructive text-destructive bg-destructive/10",
  },
  hampir_habis: {
    label: "Hampir Habis",
    badgeClass: "border border-secondary text-secondary bg-secondary/10",
  },
}

export const STOCKS: Stock[] = [
  { id: "1", name: "Bawang Putih", quantity: 100, unit: "g", minStock: 50, maxStock: 500, status: "tersedia" },
  { id: "2", name: "Cabai Merah", quantity: 100, unit: "g", minStock: 50, maxStock: 500, status: "habis" },
  { id: "3", name: "Ayam", quantity: 2, unit: "Potong", minStock: 5, maxStock: 50, status: "hampir_habis" },
  { id: "4", name: "Beras", quantity: 10, unit: "kg", minStock: 5, maxStock: 50, status: "tersedia" },
  { id: "5", name: "Minyak Goreng", quantity: 2, unit: "liter", minStock: 3, maxStock: 20, status: "hampir_habis" },
]