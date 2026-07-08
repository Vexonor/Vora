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
import { toast } from "sonner"

interface PriceSectionProps {
  paymentType?: string
  paymentMethod?: string
  customerName?: string
}

/**
 * Lazily load Midtrans Snap.js so we can open the payment popup and react to
 * its callbacks (onSuccess/onPending/onClose) — this guarantees the customer is
 * redirected to the order-status page instead of being stranded on Midtrans.
 * Resolves to `false` when Snap can't be used (no client key / load error) so
 * the caller can fall back to the full-page redirect URL.
 */
const loadSnap = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false)
    const w = window as unknown as { snap?: unknown }
    if (w.snap) return resolve(true)

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey) return resolve(false)

    // Don't infer env from the key prefix — some Midtrans sandbox accounts use
    // "Mid-..." keys (no "SB-"). Default to sandbox; set the flag for production.
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    const script = document.createElement("script")
    script.src = isProd
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", clientKey)
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const PriceSection = ({ paymentType, paymentMethod, customerName }: PriceSectionProps) => {
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
      toast.warning("Silakan pilih tipe pembayaran terlebih dahulu.")
      return
    }

    if (paymentType === "online" && !paymentMethod) {
      toast.warning("Silakan pilih metode pembayaran (Bank/E-Wallet) terlebih dahulu.")
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
        customer_name: customerName?.trim() || undefined,
        items
      })

      // 4. Proses berdasarkan tipe pembayaran
      const statusUrl = `/payment/status/${order.id}`
      if (paymentType === "online") {
        // Panggil Midtrans beserta metode yang dipilih dan URL kembali
        const returnUrl = window.location.origin + statusUrl
        const snap = await paymentService.createSnap(order.id, paymentMethod, returnUrl)
        clearCart()

        // Coba pakai Snap popup agar bisa redirect otomatis lewat callback.
        const snapReady = await loadSnap()
        const w = window as unknown as {
          snap?: { pay: (token: string, opts: Record<string, () => void>) => void }
        }
        if (snapReady && w.snap) {
          w.snap.pay(snap.token, {
            onSuccess: () => router.push(statusUrl),
            onPending: () => router.push(statusUrl),
            onError: () => router.push(statusUrl),
            onClose: () => router.push(statusUrl),
          })
        } else {
          // Fallback: full-page redirect (finish callback sudah di-set di server)
          window.location.href = snap.redirect_url
        }
      } else {
        // Bayar di kasir, langsung ke halaman sukses
        clearCart()
        router.push(statusUrl)
      }

    } catch (error) {
      console.error("Gagal memproses pembayaran:", error)
      toast.error("Terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.")
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