import { OrderPage } from "@/components/shared/order/order-page"
import { MANAGER_FILTER_TABS } from "@/lib/constant/order"

export default function ManagerOrderPage() {
  return <OrderPage filterTabs={MANAGER_FILTER_TABS} />
}