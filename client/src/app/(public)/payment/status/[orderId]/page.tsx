"use client"

import { Button } from "@/components/ui/button"
import { canViewInvoice } from "@/lib/invoice-access"
import { getOrderPlace } from "@/lib/order-place"
import { useOrderDetail } from "@/hooks/queries/use-orders"
import { OrderStatus } from "@/types/order"
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

const ORDER_PROGRESS_STEPS = [
  { status: OrderStatus.PENDING, label: "Menunggu", description: "Pesanan diterima", Icon: ClockIcon },
  { status: OrderStatus.PROCESSING, label: "Diproses", description: "Dapur sedang menyiapkan", Icon: ChefHatIcon },
  { status: OrderStatus.READY, label: "Siap", description: "Pesanan siap disajikan", Icon: BellIcon },
  { status: OrderStatus.COMPLETED, label: "Selesai", description: "Selamat menikmati", Icon: CheckCircle2Icon },
]

export default function OrderStatusPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = Number(params?.orderId)

  const orderQuery = useOrderDetail(orderId, { pollUntilFinal: true })
  const order = orderQuery.data ?? null
  const isValidOrderId = Number.isInteger(orderId) && orderId > 0
  const isLoading = isValidOrderId && orderQuery.isPending
  const error = !isValidOrderId
    ? "Nomor pesanan tidak valid"
    : orderQuery.isError && !order
      ? orderQuery.error instanceof Error ? orderQuery.error.message : "Gagal memuat status pesanan"
      : null

  const status = order ? Number(order.status) : null
  const isCanceled = status === OrderStatus.CANCELED
  const isFinalStatus = status === OrderStatus.COMPLETED || isCanceled
  const canPrintInvoice = order ? canViewInvoice(order) : false
  const currentStepIndex = ORDER_PROGRESS_STEPS.findIndex((step) => step.status === status)

  const invoiceLink = (
    <Link href={`/payment/invoice?orderId=${orderId}`} className="w-full">
      <Button className="w-full bg-secondary text-primary font-semibold py-3 rounded-lg gap-2">
        <ReceiptTextIcon className="size-5" />
        Lihat Struk (Invoice)
      </Button>
    </Link>
  )

  if (isLoading) {
    return (
      <div className="w-full h-dvh bg-primary flex items-center justify-center">
        <Loader2Icon className="size-10 animate-spin text-primary-foreground" />
      </div>
    )
  }

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

        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 text-sm">
          <span className="font-semibold">{getOrderPlace(order).name}</span>
          <span className="text-muted-foreground">Pesanan #{order.id}</span>
        </div>

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
            {ORDER_PROGRESS_STEPS.map((step, stepIndex) => {
              const isReached = stepIndex <= currentStepIndex
              const isCompleted = stepIndex < currentStepIndex
              const isCurrent = stepIndex === currentStepIndex && !isFinalStatus
              const isLastStep = stepIndex === ORDER_PROGRESS_STEPS.length - 1
              return (
                <div key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isReached ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <step.Icon className="size-4" />
                    </div>
                    {!isLastStep && (
                      <div className={`w-0.5 flex-1 min-h-8 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className={`pb-6 ${isReached ? "" : "opacity-70"}`}>
                    <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                          <Loader2Icon className="size-3 animate-spin" />
                          memperbarui…
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {canPrintInvoice && invoiceLink}

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
