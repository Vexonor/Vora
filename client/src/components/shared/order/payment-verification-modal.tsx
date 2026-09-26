"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-error"
import { formatRupiah } from "@/lib/format"
import { countOrderItems, getOrderItemName } from "@/lib/order"
import { getOrderPlace } from "@/lib/order-place"
import { usePaymentForOrder, useVerifyCashPayment } from "@/hooks/queries/use-payments"
import { useRefreshOrderData } from "@/hooks/queries/use-orders"
import type { Order } from "@/types/order"
import type { CashPaymentResult, Payment } from "@/types/payment"
import { PaymentType } from "@/types/payment"
import { CheckCircle, Clock, CreditCard, Delete, Loader2, Wallet } from "lucide-react"
import Image from "next/image"
import { Fragment, useState } from "react"
import { OrderPlaceTile } from "./order-summary"

type PaymentMethod = "cash" | "online"

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Tunai", icon: <Wallet className="size-4" /> },
  { value: "online", label: "Online", icon: <CreditCard className="size-4" /> },
]

const BACKSPACE_KEY = "⌫"
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", BACKSPACE_KEY]

type CashAmountNumpadProps = {
  totalAmount: number
  isSubmitting: boolean
  onPay: (receivedAmount: number) => void
}

function CashAmountNumpad({ totalAmount, isSubmitting, onPay }: CashAmountNumpadProps) {
  const [typedAmount, setTypedAmount] = useState("")

  const receivedAmount = typedAmount === "" ? totalAmount : parseInt(typedAmount, 10)
  const changeAmount = receivedAmount - totalAmount
  const isUnderpaid = changeAmount < 0

  const handleKeyPress = (key: string) => {
    if (key === BACKSPACE_KEY) return setTypedAmount((previous) => previous.slice(0, -1))
    if (key === "000") return setTypedAmount((previous) => (previous === "" ? "" : previous + "000"))
    if (key === "0" && typedAmount === "") return
    setTypedAmount((previous) => previous + key)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-center text-xs text-muted-foreground">Uang Diterima</p>
        <p className={`text-center text-2xl font-bold ${isUnderpaid ? "text-destructive" : "text-foreground"}`}>
          {formatRupiah(receivedAmount)}
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span className="font-medium">{formatRupiah(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{isUnderpaid ? "Kurang" : "Kembalian"}</span>
          <span className={`font-bold ${isUnderpaid ? "text-destructive" : changeAmount > 0 ? "text-green-600" : "text-foreground"}`}>
            {formatRupiah(Math.abs(changeAmount))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {NUMPAD_KEYS.map((key) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => handleKeyPress(key)}
            className="py-3 font-semibold"
            disabled={isSubmitting}
          >
            {key === BACKSPACE_KEY ? <Delete className="size-4" /> : key}
          </Button>
        ))}
      </div>

      {isUnderpaid && (
        <p className="text-xs text-destructive text-center">
          Uang yang diterima kurang {formatRupiah(Math.abs(changeAmount))} dari total tagihan.
        </p>
      )}

      <Button
        onClick={() => onPay(receivedAmount)}
        disabled={isSubmitting || isUnderpaid}
        className="w-full bg-secondary text-white font-semibold rounded-lg py-2"
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
        Bayar Sekarang
      </Button>
    </div>
  )
}

function CashPaymentSuccess({ result, onClose }: { result: CashPaymentResult; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
        <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-700">Pembayaran Berhasil</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pembayaran tunai telah diverifikasi. Serahkan kembalian kepada pelanggan.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-lg border border-foreground/10 py-6">
        <p className="text-sm text-muted-foreground">Kembalian</p>
        <p className="text-4xl font-bold text-green-600">{formatRupiah(result.change_amount)}</p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span className="font-medium">{formatRupiah(result.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uang Diterima</span>
          <span className="font-medium">{formatRupiah(result.paid)}</span>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Selesai
      </Button>
    </div>
  )
}

function OnlinePaymentInfo({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const isSettled = payment.payment_status === "settlement"

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-start gap-3 p-3 rounded-lg ${isSettled ? "bg-green-50" : "bg-yellow-50"}`}>
        {isSettled ? (
          <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <Clock className="size-5 text-yellow-600 mt-0.5 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-semibold ${isSettled ? "text-green-700" : "text-yellow-700"}`}>
            {isSettled ? "Pembayaran Diterima" : "Menunggu Konfirmasi"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSettled
              ? "Pembayaran telah dikonfirmasi secara otomatis oleh sistem."
              : "Menunggu konfirmasi pembayaran dari Midtrans. Minta pelanggan menyelesaikan pembayaran."}
          </p>
        </div>
      </div>

      {payment.qr_image_url && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Bukti Pembayaran</p>
          <div className="rounded-lg overflow-hidden border border-foreground/10">
            <Image
              src={payment.qr_image_url}
              alt="Bukti pembayaran"
              width={600}
              height={280}
              className="w-full object-contain max-h-[280px]"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status Pembayaran</span>
          <span className={`font-semibold capitalize ${isSettled ? "text-green-600" : "text-yellow-600"}`}>
            {payment.payment_status ?? "-"}
          </span>
        </div>
        {payment.midtrans_transaction_id && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">ID Transaksi</span>
            <span className="text-xs font-mono text-right break-all">{payment.midtrans_transaction_id}</span>
          </div>
        )}
      </div>

      <Button onClick={onClose} className="w-full">
        Tutup
      </Button>
    </div>
  )
}

function MissingOnlinePaymentInfo({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50">
        <Clock className="size-5 text-yellow-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-yellow-700">Belum Ada Transaksi Online</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pesanan ini belum punya transaksi pembayaran online. Pilih metode Tunai
            untuk memverifikasi pembayaran di kasir.
          </p>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Tutup
      </Button>
    </div>
  )
}

type Props = {
  order: Order
  onClose: () => void
}

export function PaymentVerificationModal({ order, onClose }: Props) {
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod>("cash")
  const paymentQuery = usePaymentForOrder(order.id)
  const verifyCashPayment = useVerifyCashPayment()
  const refreshOrderData = useRefreshOrderData()

  const place = getOrderPlace(order)
  const items = order.items ?? []
  const totalAmount = Number(order.total_price)

  const payment = paymentQuery.data ?? null
  const isLoadingPayment = paymentQuery.isPending
  const hasPaymentLoadError = paymentQuery.isError
  const isMethodLocked = payment !== null
  const selectedMethod: PaymentMethod = payment
    ? payment.type === PaymentType.ONLINE ? "online" : "cash"
    : chosenMethod
  const cashPaymentResult = verifyCashPayment.data ?? null
  const isVerifyingCash = verifyCashPayment.isPending
  const cashVerificationError = verifyCashPayment.isError
    ? getApiErrorMessage(verifyCashPayment.error, "Gagal verifikasi pembayaran. Coba lagi.")
    : null

  const handleRetryLoadPayment = () => paymentQuery.refetch()

  const handleCashPayment = (receivedAmount: number) =>
    verifyCashPayment.mutate({ orderId: order.id, receivedAmount })

  const handleClose = () => {
    if (cashPaymentResult) refreshOrderData()
    onClose()
  }

  const renderPaymentPanel = () => {
    if (cashPaymentResult) return <CashPaymentSuccess result={cashPaymentResult} onClose={handleClose} />
    if (isLoadingPayment) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )
    }
    if (hasPaymentLoadError) {
      return (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-destructive">
            Gagal memuat status pembayaran. Pastikan pesanan belum dibayar online sebelum menerima uang tunai.
          </p>
          <Button variant="outline" onClick={handleRetryLoadPayment}>
            Coba lagi
          </Button>
        </div>
      )
    }
    if (selectedMethod === "online") {
      return payment
        ? <OnlinePaymentInfo payment={payment} onClose={handleClose} />
        : <MissingOnlinePaymentInfo onClose={handleClose} />
    }
    return (
      <>
        <CashAmountNumpad totalAmount={totalAmount} isSubmitting={isVerifyingCash} onPay={handleCashPayment} />
        {cashVerificationError && (
          <p className="text-xs text-destructive text-center -mt-2">{cashVerificationError}</p>
        )}
      </>
    )
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl min-w-sm sm:min-w-xl md:min-w-2xl lg:min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Informasi Pemesanan</p>
            <div className="flex items-center gap-3">
              <OrderPlaceTile code={place.code} />
              <div>
                <p className="font-semibold text-sm">{place.name}</p>
                <p className="text-xs text-muted-foreground">
                  Order #{order.id} · {countOrderItems(order)} item
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted-foreground">Detail Transaksi</p>
              <hr className="border-foreground/10 my-1" />

              <div className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-x-3">
                <span className="text-xs font-semibold text-muted-foreground pb-1">Menu</span>
                <span className="text-xs font-semibold text-muted-foreground pb-1 text-center">Qty</span>
                <span className="text-xs font-semibold text-muted-foreground pb-1 text-right">Harga</span>
                <span className="text-xs font-semibold text-muted-foreground pb-1 text-right">Subtotal</span>

                <hr className="col-span-4 border-foreground/10" />

                {items.length === 0 ? (
                  <p className="col-span-4 text-sm text-muted-foreground py-2">
                    Tidak ada item pada pesanan ini.
                  </p>
                ) : (
                  items.map((item) => (
                    <Fragment key={item.id}>
                      <span className="min-w-0 wrap-break-word text-sm py-1 leading-snug">
                        {getOrderItemName(item)}
                      </span>
                      <span className="text-sm py-1 leading-snug text-center tabular-nums whitespace-nowrap">
                        {item.quantity}
                      </span>
                      <span className="text-sm py-1 leading-snug text-right tabular-nums whitespace-nowrap text-muted-foreground">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-sm py-1 leading-snug text-right tabular-nums whitespace-nowrap font-medium">
                        {formatRupiah(item.total_price)}
                      </span>
                    </Fragment>
                  ))
                )}
              </div>

              <hr className="border-foreground/10 my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Metode Pembayaran</p>

            <Select
              value={selectedMethod}
              onValueChange={(method) => setChosenMethod(method as PaymentMethod)}
              disabled={isMethodLocked || isLoadingPayment || hasPaymentLoadError || cashPaymentResult !== null}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {renderPaymentPanel()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
