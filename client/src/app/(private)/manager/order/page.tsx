import { OrderPage, type OrderStatusTab } from "@/components/shared/order/order-page"
import { OrderStatus } from "@/types/order"

const MANAGER_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
  { label: "Dibatalkan", status: OrderStatus.CANCELED },
]

export default function ManagerOrderPage() {
  return <OrderPage statusTabs={MANAGER_STATUS_TABS} />
}
