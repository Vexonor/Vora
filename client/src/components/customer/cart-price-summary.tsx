import { Separator } from "@/components/ui/separator"
import { formatRupiah } from "@/lib/format"
import { addTaxToSubtotal, TAX_RATE } from "@/lib/pricing"

export function CartPriceSummary({ subtotal }: { subtotal: number }) {
  const { tax, total } = addTaxToSubtotal(subtotal)

  return (
    <>
      <div className="flex flex-col justify-center gap-1">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Subtotal:</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <span>PPN ({TAX_RATE * 100}%):</span>
          <span>{formatRupiah(tax)}</span>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between items-center text-sm font-semibold">
        <span>Total:</span>
        <span>{formatRupiah(total)}</span>
      </div>
    </>
  )
}
