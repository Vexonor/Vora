import { SearchInput } from "@/components/search-input"
import { CheckCheckIcon, TimerIcon } from "lucide-react"

type OrderStatus = "siap" | "proses"

type Order = {
  tableCode: string
  tableName: string
  itemCount: number
  status: OrderStatus
}

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  icon: React.ReactNode
  buttonClass: string
  dotClass: string
  description: string
}> = {
  siap: {
    label: "Siap",
    icon: <CheckCheckIcon className="size-3.5" />,
    buttonClass: "border border-primary text-primary",
    dotClass: "bg-primary",
    description: "Siap disajikan",
  },
  proses: {
    label: "Proses",
    icon: <TimerIcon className="size-3.5" />,
    buttonClass: "border border-secondary text-secondary",
    dotClass: "bg-secondary",
    description: "Sedang diproses",
  },
}

const TABLE_COLOR: Record<OrderStatus, string> = {
  siap: "bg-primary",
  proses: "bg-secondary",
}

const ORDERS: Order[] = [
  { tableCode: "T-02", tableName: "Meja 02", itemCount: 8, status: "siap" },
  { tableCode: "T-08", tableName: "Meja 08", itemCount: 2, status: "proses" },
]

function OrderItem({ tableCode, tableName, itemCount, status }: Order) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex items-center gap-3">
      <div className={`${TABLE_COLOR[status]} text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center`}>
        {tableCode}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{tableName}</p>
        <p className="text-xs text-muted-foreground">{itemCount} items</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${config.buttonClass}`}>
          {config.icon}
          {config.label}
        </button>
        <div className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${config.dotClass}`} />
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </div>
      </div>
    </div>
  )
}

export function OrderList() {
  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pesanan</h4>
      <SearchInput placeholder="Cari pesanan ..." />
      <div className="flex flex-col gap-3">
        {ORDERS.map((order) => (
          <OrderItem key={order.tableCode} {...order} />
        ))}
      </div>
    </div>
  )
}