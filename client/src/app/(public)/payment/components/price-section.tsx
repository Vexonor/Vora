"use client"

import { Button } from "@/components/ui/button"
import { DrawerFooter } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import useCart from "@/hooks/use-cart"
import { orderService } from "@/services/order.service"
import { paymentService } from "@/services/payment.service"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PriceSectionProps {
  paymentType?: string
  paymentMethod?: string
}

const PriceSection = ({ paymentType, paymentMethod }: PriceSectionProps) => {
  const router = useRouter()
  const {
    cartItems,
    getTotalPrice,
    clearCart
  } = useCart()

  const [isLoading, setIsLoading] = useState(false)

  const subtotal = getTotalPrice()
  const taxRate = 0.10
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const handlePayment = async () => {
    if (!paymentType) {
      alert("Silakan pilih tipe pembayaran terlebih dahulu.")
      return
    }
    
    if (paymentType === "online" && !paymentMethod) {
      alert("Silakan pilih metode pembayaran (Bank/E-Wallet) terlebih dahulu.")
      return
    }

    setIsLoading(true)
    try {
      // 1. Dapatkan table_id dari localStorage (hasil scan QR)
      const storedTableId = localStorage.getItem("table_id")
      const tableId = storedTableId ? parseInt(storedTableId, 10) : 1

      // 2. Siapkan data pesanan
      const items = cartItems.map(item => ({
        menu_id: item.menu.id,
        quantity: item.quantity
      }))

      // 3. Buat pesanan ke backend
      const order = await orderService.create({
        table_id: tableId,
        items
      })

      // 4. Proses berdasarkan tipe pembayaran
      if (paymentType === "online") {
        // Panggil Midtrans beserta metode yang dipilih dan URL kembali
        const returnUrl = window.location.origin + `/payment/status/${order.id}`
        const snap = await paymentService.createSnap(order.id, paymentMethod, returnUrl)
        clearCart()
        window.location.href = snap.redirect_url
      } else {
        // Bayar di kasir, langsung ke halaman sukses
        clearCart()
        router.push(`/payment/status/${order.id}`)
      }

    } catch (error) {
      console.error("Gagal memproses pembayaran:", error)
      alert("Terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

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
            <Button
              onClick={handlePayment}
              disabled={isLoading || !paymentType || (paymentType === "online" && !paymentMethod)}
              className="w-full bg-secondary text-primary font-semibold rounded-lg p-6 hover:bg-secondary/90 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="size-5 animate-spin" />
                  Memproses...
                </div>
              ) : (
                "Bayar Sekarang"
              )}
            </Button>
          </DrawerFooter>
        </div>
      )}
    </div>
  )
}

export default PriceSection