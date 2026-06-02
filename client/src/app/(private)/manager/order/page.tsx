import { OrderPage } from "@/components/shared/order/order-page"

const MANAGER_FILTER_TABS = [
  { label: "Semua", value: "semua" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Diproses", value: "diproses" },
  { label: "Siap", value: "siap" },
  { label: "Selesai", value: "selesai" },
  { label: "Dibatalkan", value: "dibatalkan" },
] as const

export default function ManagerOrderPage() {
  return <OrderPage filterTabs={MANAGER_FILTER_TABS} />
}