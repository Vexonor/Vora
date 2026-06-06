export type KitchenStatus = "process" | "paid" | "unpaid" | "unverified" | "ready"

export type MenuCategory = "makanan" | "minuman"

export type KitchenMenuItem = {
  name: string
  qty: number
  image: string
  note?: string
  category: MenuCategory
}

export type KitchenOrder = {
  id: string
  tableCode: string
  tableName: string
  itemCount: number
  status: KitchenStatus
  date: string
  time: string
  items: KitchenMenuItem[]
  subtotal: number
  tax: number
  total: number
}

export const KITCHEN_STATUS_CONFIG: Record<KitchenStatus, {
  label: string
  description: string
  buttonClass: string
  dotClass: string
}> = {
  process: {
    label: "Proses",
    description: "Sedang diproses",
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
  },
  paid: {
    label: "Sudah Bayar",
    description: "Silahkan proses",
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
  },
  unpaid: {
    label: "Belum Bayar",
    description: "Silahkan verifikasi",
    buttonClass: "border border-destructive text-destructive",
    dotClass: "bg-destructive",
  },
  unverified: {
    label: "Belum Verifikasi",
    description: "Silahkan verifikasi",
    buttonClass: "border border-destructive text-destructive",
    dotClass: "bg-destructive",
  },
  ready: {
    label: "Siap",
    description: "Siap disajikan",
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
  },
}

export const KITCHEN_FILTER_TABS = [
  { label: "Semua", value: "semua" },
  { label: "Proses", value: "process" },
  { label: "Selesai", value: "ready" },
  { label: "Sudah Bayar", value: "paid" },
  { label: "Belum Bayar", value: "unpaid" },
] as const

export const KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: "1", tableCode: "T-08", tableName: "Meja 08", itemCount: 8, status: "process",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "Yang satu jangan manis", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "2", tableCode: "T-01", tableName: "Meja 01", itemCount: 8, status: "process",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "Yang satu jangan manis", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "3", tableCode: "T-05", tableName: "Meja 05", itemCount: 8, status: "paid",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "4", tableCode: "T-11", tableName: "Meja 11", itemCount: 8, status: "paid",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "5", tableCode: "T-04", tableName: "Meja 04", itemCount: 8, status: "unpaid",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "6", tableCode: "T-03", tableName: "Meja 03", itemCount: 8, status: "unverified",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "7", tableCode: "T-02", tableName: "Meja 02", itemCount: 8, status: "ready",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "Yang satu jangan manis", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
  {
    id: "8", tableCode: "T-06", tableName: "Meja 06", itemCount: 8, status: "ready",
    date: "Selasa, 21 Okt 2025", time: "16:17 WIB",
    items: [
      { name: "Nasi Goreng", qty: 2, image: "/images/nasi-goreng.jpg", note: "", category: "makanan" },
      { name: "Teh Obeng", qty: 4, image: "/images/teh-obeng.jpg", note: "", category: "minuman" },
    ],
    subtotal: 50000, tax: 5000, total: 55000,
  },
]