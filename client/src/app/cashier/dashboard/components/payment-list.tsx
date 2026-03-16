import { SearchInput } from "@/components/search-input"

type PaymentTableVariant = "primary" | "secondary"

type Payment = {
  tableCode: string
  tableName: string
  orderNumber: string
  variant: PaymentTableVariant
}

const TABLE_COLOR: Record<PaymentTableVariant, string> = {
  primary: "bg-secondary",
  secondary: "bg-primary",
}

const PAYMENTS: Payment[] = [
  { tableCode: "T-08", tableName: "Meja 08", orderNumber: "Order #944", variant: "primary" },
  { tableCode: "T-02", tableName: "Meja 02", orderNumber: "Order #122", variant: "secondary" },
]

function PaymentItem({ tableCode, tableName, orderNumber, variant }: Payment) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${TABLE_COLOR[variant]} text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center`}>
        {tableCode}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{tableName}</p>
        <p className="text-xs text-muted-foreground">{orderNumber}</p>
      </div>
      <button className="bg-secondary text-white text-xs font-semibold px-4 py-2 rounded-lg">
        Verifikasi
      </button>
    </div>
  )
}

export function PaymentList() {
  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pembayaran</h4>
      <SearchInput placeholder="Cari pembayaran ..." />
      <div className="flex flex-col gap-3">
        {PAYMENTS.map((payment) => (
          <PaymentItem key={payment.tableCode} {...payment} />
        ))}
      </div>
    </div>
  )
}