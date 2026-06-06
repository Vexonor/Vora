"use client"

import { orderService } from "@/services/order.service"
import { downloadInvoiceAsPDF } from "@/lib/invoice-download"
import { OrderStatus, type Order } from "@/types/order"
import { DownloadIcon, Loader2Icon, ReceiptTextIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const InvoiceContent = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      setErrorMsg("Parameter orderId tidak ditemukan di URL")
      return
    }

    orderService.getById(parseInt(orderId, 10))
      .then(data => setOrder(data))
      .catch(err => {
        console.error("Failed to fetch order invoice:", err)
        setErrorMsg(err.message || "Gagal mengambil data dari server")
      })
      .finally(() => setIsLoading(false))
  }, [orderId])

  if (isLoading) {
    return (
      <div className="w-full h-dvh bg-primary flex items-center justify-center">
        <Loader2Icon className="size-10 animate-spin text-primary-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full h-dvh bg-primary flex flex-col items-center justify-center text-primary-foreground gap-4">
        <ReceiptTextIcon className="size-16 opacity-50" />
        <h2 className="text-xl font-bold">Invoice Tidak Ditemukan</h2>
        <p>Pesanan tidak ditemukan atau link tidak valid.</p>
        {errorMsg && <p className="text-sm text-red-300 mt-2">Error: {errorMsg} (orderId: {orderId})</p>}
      </div>
    )
  }

  // Struk hanya tersedia setelah pesanan dikonfirmasi kasir / diproses dapur.
  // Cegah akses langsung saat pesanan masih menunggu atau telah dibatalkan.
  const status = Number(order.status)
  const isPaid = order.payment?.payment_status === "settlement"
  const invoiceAllowed =
    isPaid ||
    status === OrderStatus.PROCESSING ||
    status === OrderStatus.READY ||
    status === OrderStatus.COMPLETED

  if (!invoiceAllowed) {
    const isCanceled = status === OrderStatus.CANCELED
    return (
      <div className="w-full h-dvh bg-primary flex flex-col items-center justify-center text-primary-foreground gap-4 px-6 text-center">
        <ReceiptTextIcon className="size-16 opacity-50" />
        <h2 className="text-xl font-bold">
          {isCanceled ? "Pesanan Dibatalkan" : "Struk Belum Tersedia"}
        </h2>
        <p className="text-sm opacity-80 max-w-xs">
          {isCanceled
            ? "Pesanan ini telah dibatalkan, sehingga struk tidak dapat dicetak."
            : "Struk dapat dicetak setelah pesanan dikonfirmasi kasir atau sedang diproses oleh dapur."}
        </p>
      </div>
    )
  }

  // Calculate taxes since the backend returns total_price directly, we infer subtotal
  const subtotal = order.total_price / 1.10
  const tax = order.total_price - subtotal

  return (
    <div className="w-full min-h-dvh bg-primary py-8 px-4">
      <div className="max-w-md mx-auto relative">
        {/* Receipt Top Zigzag Decor */}
        <div className="absolute -top-2 left-0 right-0 h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
        
        <div className="bg-white px-6 py-10 flex flex-col items-center shadow-xl">
          {/* Header */}
          <div className="w-full flex flex-col items-center gap-1 text-xs text-foreground text-center font-medium mb-8">
            <span className="text-xl font-bold uppercase tracking-wider mb-2">Vora POS</span>
            <span>Asam Pedas Tepi Danau</span>
            <p className="text-muted-foreground">Jl. Ruko Greenland No.9-11 Blok R, Tlk. Tering, Kec. Batam Kota, Batam</p>
            <span className="text-muted-foreground">TEL: 0812-9501-2089</span>
          </div>
          
          {/* Invoice Detail */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-end border-b border-dashed border-foreground/30 pb-4 mb-2">
              <span className="text-2xl text-foreground font-bold">Meja {String(order.table_id).padStart(2, "0")}</span>
              <span className="text-xs px-2 py-1 bg-success/20 text-success font-semibold rounded uppercase">
                {order.status_name || "Lunas"}
              </span>
            </div>

            <table className="w-full text-sm text-left text-muted-foreground">
              <tbody>
                <tr>
                  <td className="w-32 py-1 font-medium text-foreground">No. Pesanan</td>
                  <td className="w-4 flex justify-end">:</td>
                  <td className="text-right font-medium text-foreground">#{order.id}</td>
                </tr>
                {order.customer_name && (
                  <tr>
                    <td className="w-32 py-1 font-medium text-foreground">Pelanggan</td>
                    <td className="w-4 flex justify-end">:</td>
                    <td className="text-right font-medium text-foreground">{order.customer_name}</td>
                  </tr>
                )}
                <tr>
                  <td className="w-32 py-1 font-medium text-foreground">Tanggal</td>
                  <td className="w-4 flex justify-end">:</td>
                  <td className="text-right">{format(new Date(order.created_at || Date.now()), "dd MMM yyyy, HH:mm", { locale: id })}</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full my-2 border-t border-dashed border-foreground/30" />
          </div>

          {/* Order Detail */}
          <div className="w-full flex flex-col gap-2 mt-2">
            <table className="w-full text-sm">
              <tbody className="flex flex-col gap-3">
                {order.items?.map((item) => (
                  <tr key={item.id} className="w-full flex flex-wrap items-start">
                    <td className="flex-[2] text-start pr-2">
                      <div className="font-medium text-foreground">{item.menu?.name || `Menu #${item.menu_id}`}</div>
                      <div className="text-xs text-muted-foreground">{item.quantity} x {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.price)}</div>
                    </td>
                    <td className="flex-1 text-end font-medium">
                      {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="w-full my-4 border-t border-dashed border-foreground/30" />
          </div>

          {/* Price Detail */}
          <div className="w-full flex flex-col gap-2">
            <table className="w-full text-sm text-muted-foreground">
              <tbody className="flex flex-col gap-2">
                <tr className="w-full flex justify-between items-center">
                  <td className="text-start">Subtotal</td>
                  <td className="text-end">{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(subtotal)}</td>
                </tr>
                <tr className="w-full flex justify-between items-center">
                  <td className="text-start">PPN (10%)</td>
                  <td className="text-end">{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(tax)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-foreground/10 text-lg text-foreground font-bold">
              <span>Total</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_price)}</span>
            </div>
            <div className="w-full my-4 border-t border-dashed border-foreground/30" />
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-center mt-4 gap-2">
            <ReceiptTextIcon className="size-8 text-muted-foreground/30" />
            <p className="text-center text-xs text-muted-foreground font-medium max-w-[200px]">
              Terima kasih atas kunjungan Anda. Pesanan Anda sedang disiapkan!
            </p>
          </div>
        </div>

        {/* Receipt Bottom Zigzag Decor */}
        <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
      </div>

      {/* Download Button */}
      <div className="max-w-md mx-auto mt-8 px-4 pb-8">
        <button
          onClick={() => downloadInvoiceAsPDF(order)}
          className="w-full flex items-center justify-center gap-2 bg-white text-primary font-semibold py-3 rounded-xl shadow-md hover:bg-white/90 active:scale-95 transition-all"
        >
          <DownloadIcon className="size-4" />
          Download Invoice (PDF)
        </button>
      </div>
    </div>
  )
}

export default function Invoice() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-dvh bg-primary flex items-center justify-center">
          <Loader2Icon className="size-10 animate-spin text-primary-foreground" />
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  )
}