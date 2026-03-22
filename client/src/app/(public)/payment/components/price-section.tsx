
"use client"

import { DrawerFooter } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import useCart from "@/hooks/use-cart"
import Link from "next/link"

const PriceSection = () => {
  const {
    cartItems,
    getTotalPrice,
  } = useCart()

  const subtotal = getTotalPrice()
  const taxRate = 0.10
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return (
    <div className="w-full max-w-sm md:max-w-3xl mx-auto flex flex-col h-full border-dashed border-t-2 border-foreground/30">
      {cartItems.length > 0 && (
        <div className="pt-6 space-y-3">
          <div className="flex flex-col justify-center gap-1">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Subtotal:</span>
              <span>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>PPN (10%):</span>
              <span>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(taxAmount)}
              </span>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(total)}
            </span>
          </div>

          <DrawerFooter className="px-0 gap-2 mb-8">
            <Link href="/customer/payment/status/1" className="bg-secondary text-primary font-semibold rounded-lg p-2 text-center">
              Bayar Sekarang
            </Link>
          </DrawerFooter>
        </div>
      )}
    </div>
  )
}

export default PriceSection