"use client"

import { CartPriceSummary } from "@/components/customer/cart-price-summary"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { readCustomerTableId } from "@/lib/customer-table"
import { openSnapPayment } from "@/lib/midtrans-snap"
import { orderService } from "@/services/order.service"
import { paymentService } from "@/services/payment.service"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { CustomerPaymentType } from "./payment-type-section"

type Props = {
  paymentType: CustomerPaymentType
  onlinePaymentMethod?: string
  customerName: string
}

export function CheckoutSummary({ paymentType, onlinePaymentMethod, customerName }: Props) {
  const router = useRouter()
  const { cartItems, subtotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMissingOnlineMethod = paymentType === "online" && !onlinePaymentMethod

  const handleCheckout = async () => {
    if (isMissingOnlineMethod) {
      toast.warning("Silakan pilih metode pembayaran (Bank/E-Wallet) terlebih dahulu.")
      return
    }

    setIsSubmitting(true)
    try {
      const order = await orderService.create({
        table_id: readCustomerTableId(),
        customer_name: customerName.trim() || undefined,
        items: cartItems.map((item) => ({ menu_id: item.menu.id, quantity: item.quantity })),
      })

      const orderStatusPath = `/payment/status/${order.id}`
      if (paymentType === "offline") {
        clearCart()
        router.push(orderStatusPath)
        return
      }

      const snapTransaction = await paymentService.createSnapTransaction(
        order.id,
        onlinePaymentMethod,
        window.location.origin + orderStatusPath,
      )
      clearCart()
      await openSnapPayment(snapTransaction.token, snapTransaction.redirect_url, () => router.push(orderStatusPath))
    } catch {
      toast.error("Terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) return null

  return (
    <div className="w-full max-w-sm md:max-w-3xl mx-auto flex flex-col h-full border-dashed border-t-2 border-foreground/30">
      <div className="pt-6 space-y-3">
        <CartPriceSummary subtotal={subtotal} />
        <div className="flex flex-col gap-2 mb-8">
          <Button
            onClick={handleCheckout}
            disabled={isSubmitting || isMissingOnlineMethod}
            className="w-full bg-secondary text-white font-semibold rounded-lg p-6 hover:bg-secondary/90 transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="size-5 animate-spin" />
                Memproses...
              </div>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
