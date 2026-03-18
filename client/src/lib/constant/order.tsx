export type OrderStatus = "done" | "process" | "unpaid"

export type MenuItem = {
  name: string
  qty: number
  price: number
}

export type Transaction = {
  id: string
  tableCode: string
  tableName: string
  itemCount: number
  status: OrderStatus
  date: string
  time: string
  items: MenuItem[]
  subtotal: number
  tax: number
  total: number
}

export const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  description: string
  buttonClass: string
  dotClass: string
  icon: string
}> = {
  done: {
    label: "Siap",
    description: "Siap disajikan",
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
    icon: "✓✓",
  },
  process: {
    label: "Proses",
    description: "Sedang diproses",
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    icon: "⏱",
  },
  unpaid: {
    label: "Belum Bayar",
    description: "Silahkan verifikasi",
    buttonClass: "border border-destructive text-destructive",
    dotClass: "bg-destructive",
    icon: "!",
  },
}

export const FILTER_TABS = [
  { label: "Semua", value: "semua" },
  { label: "Proses", value: "proses" },
  { label: "Selesai", value: "selesai" },
  { label: "Belum Bayar", value: "belum_bayar" },
] as const

export const TRANSACTIONS: Transaction[] = [
  {
    id: "1", tableCode: "T-02", tableName: "Meja 02", itemCount: 8, status: "done",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "2", tableCode: "T-04", tableName: "Meja 04", itemCount: 8, status: "unpaid",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "3", tableCode: "T-01", tableName: "Meja 01", itemCount: 8, status: "process",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "4", tableCode: "T-05", tableName: "Meja 05", itemCount: 8, status: "done",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "5", tableCode: "T-03", tableName: "Meja 03", itemCount: 8, status: "unpaid",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "6", tableCode: "T-06", tableName: "Meja 06", itemCount: 8, status: "done",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "7", tableCode: "T-11", tableName: "Meja 11", itemCount: 8, status: "process",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "8", tableCode: "T-08", tableName: "Meja 08", itemCount: 8, status: "process",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [{ name: "Nasi Goreng", qty: 2, price: 30000 }, { name: "Teh Obeng", qty: 4, price: 20000 }],
    subtotal: 50000, tax: 5000, total: 55000,
  },
]