"use client"

import { Button } from "@/components/ui/button"
import { orderService } from "@/services/order.service"
import { OrderStatus, type Order } from "@/types/order"
import {
  BellIcon,
  CheckCircle2Icon,
  ChefHatIcon,
  ClockIcon,
  Loader2Icon,
  PhoneIcon,
  ReceiptTextIcon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const POLL_INTERVAL = 8000

const STEPS = [
  { status: OrderStatus.PENDING, label: "Menunggu", desc: "Pesanan diterima", icon: ClockIcon },
  { status: OrderStatus.PROCESSING, label: "Diproses", desc: "Dapur sedang menyiapkan", icon: ChefHatIcon },
  { status: OrderStatus.READY, label: "Siap", desc: "Pesanan siap disajikan", icon: BellIcon },
  { status: OrderStatus.COMPLETED, label: "Selesai", desc: "Selamat menikmati", icon: CheckCircle2Icon },
]

export default function PaymentStatusPage() {
  const params = useParams<{ transactionId: string }>()
  const orderId = Number(params?.transactionId)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    try {
      const data = await orderService.getById(orderId)
      setOrder(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat status pesanan")
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      setError("Nomor pesanan tidak valid")
      return
    }
    fetchOrder()
  }, [orderId, fetchOrder])

  const status = order ? Number(order.status) : null
  const isCanceled = status === OrderStatus.CANCELED
  const isTerminal = status === OrderStatus.COMPLETED || isCanceled
  const isPaid = order?.payment?.payment_status === "settlement"
  // Struk tersedia jika sudah lunas, atau pesanan sudah diproses dapur
  const canPrintInvoice =
    isPaid ||
    status === OrderStatus.PROCESSING ||
    status === OrderStatus.READY ||
    status === OrderStatus.COMPLETED

  // Polling — berhenti otomatis saat status final (Selesai / Dibatalkan)
  useEffect(() => {
    if (!orderId || isTerminal) return
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchOrder()
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [orderId, isTerminal, fetchOrder])

  const InvoiceButton = (
    <Link href={`/payment/invoice?orderId=${orderId}`} className="w-full">
      <Button className="w-full bg-secondary text-primary font-semibold py-3 rounded-lg gap-2">
        <ReceiptTextIcon className="size-5" />
        Lihat Struk (Invoice)
      </Button>
    </Link>
  )

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full h-dvh bg-primary flex items-center justify-center">
        <Loader2Icon className="size-10 animate-spin text-primary-foreground" />
      </div>
    )
  }

  // ── Error / tidak ditemukan ───────────────────────────────
  if (error || !order) {
    return (
      <div className="w-full h-dvh bg-primary flex flex-col items-center justify-center gap-3 text-primary-foreground px-6 text-center">
        <XCircleIcon className="size-16 opacity-60" />
        <h2 className="text-xl font-bold">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm opacity-80">{error ?? "Data pesanan tidak tersedia."}</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-dvh bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl p-6 flex flex-col gap-6">

        {/* Header */}
        {isCanceled ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-20 bg-destructive/10 border-2 border-destructive rounded-full flex items-center justify-center">
              <XCircleIcon className="size-12 text-destructive" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-destructive">Pesanan Dibatalkan</h1>
              <p className="text-sm text-muted-foreground">Mohon maaf, pesanan Anda tidak dapat diproses.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-20 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center">
              <ReceiptTextIcon className="size-12 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Pesanan Diterima</h1>
              <p className="text-sm text-muted-foreground">Pantau status pesanan Anda di bawah ini.</p>
            </div>
          </div>
        )}

        {/* Meja & nomor pesanan */}
        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 text-sm">
          <span className="font-semibold">Meja {String(order.table_id).padStart(2, "0")}</span>
          <span className="text-muted-foreground">Pesanan #{order.id}</span>
        </div>

        {/* Body */}
        {isCanceled ? (
          <div className="flex flex-col gap-3">
            {order.cancel_reason && (
              <div className="bg-destructive/5 border border-destructive/30 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-destructive mb-1">Alasan pembatalan</p>
                <p className="text-sm text-foreground/80">{order.cancel_reason}</p>
              </div>
            )}
            <div className="flex items-start gap-2 bg-secondary/15 rounded-lg px-4 py-3">
              <PhoneIcon className="size-4 text-foreground/70 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">
                Jika Anda sudah melakukan pembayaran, silakan menghubungi atau mendatangi
                <span className="font-semibold"> kasir</span> untuk proses pengembalian dana.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {STEPS.map((step, i) => {
              const stepIndex = STEPS.findIndex((s) => s.status === status)
              const reached = i <= stepIndex
              const done = i < stepIndex
              const current = i === stepIndex && !isTerminal
              const Icon = step.icon
              const isLast = i === STEPS.length - 1
              return (
                <div key={step.status} className="flex gap-3">
                  {/* Rail */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        reached ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      } ${current ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-8 ${done ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  {/* Text */}
                  <div className={`pb-6 ${reached ? "" : "opacity-70"}`}>
                    <p className={`text-sm font-semibold ${current ? "text-primary" : "text-foreground"}`}>
                      {step.label}
                      {current && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                          <Loader2Icon className="size-3 animate-spin" />
                          memperbarui…
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {canPrintInvoice && InvoiceButton}

        {status === OrderStatus.PENDING && !canPrintInvoice && (
          <p className="text-center text-xs text-muted-foreground">
            Menunggu konfirmasi. Struk dapat dicetak setelah pesanan dibayar atau diproses dapur.
          </p>
        )}

        {(status === OrderStatus.PROCESSING || status === OrderStatus.READY) && (
          <p className="text-center text-xs text-muted-foreground">
            Halaman ini diperbarui otomatis. Mohon tunggu pesanan Anda disiapkan.
          </p>
        )}
      </div>
    </div>
  )
}
