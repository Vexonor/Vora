"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { paymentService } from "@/services/payment.service"
import type { Payment } from "@/types/payment"
import { PaymentType } from "@/types/payment"
import { CheckCircle, Clock, CreditCard, Delete, Loader2, Wallet } from "lucide-react"
import Image from "next/image"

type PaymentMethod = "tunai" | "online"

type TransactionSummary = {
  id: string
  tableCode: string
  tableName: string
  total: number
}

type Props = {
  transaction: TransactionSummary
  orderId: number
  onClose: () => void
  onVerified?: () => void
}

function Numpad({ total, onPay, loading }: { total: number; onPay: (amount: number) => void; loading: boolean }) {
  const [input, setInput] = useState("")

  const displayed = input === "" ? total : parseInt(input)

  const press = (val: string) => {
    if (val === "⌫") return setInput((p) => p.slice(0, -1))
    if (val === "000") return setInput((p) => (p === "" ? "" : p + "000"))
    if (val === "0" && input === "") return
    setInput((p) => p + val)
  }

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-2xl font-bold text-foreground">
        Rp. {displayed.toLocaleString("id-ID")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => press(key)}
            className="py-3 font-semibold"
            disabled={loading}
          >
            {key === "⌫" ? <Delete className="size-4" /> : key}
          </Button>
        ))}
      </div>
      <Button
        onClick={() => onPay(displayed)}
        disabled={loading}
        className="w-full bg-secondary text-primary font-semibold rounded-lg py-2"
      >
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        Bayar Sekarang
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

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "tunai", label: "Tunai", icon: <Wallet className="size-4" /> },
  { value: "online", label: "Online", icon: <CreditCard className="size-4" /> },
]

export function PaymentVerificationModal({ transaction, orderId, onClose, onVerified }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("tunai")
  const [payment, setPayment] = useState<Payment | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [methodLocked, setMethodLocked] = useState(false)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await paymentService.getByOrderId(orderId)
        setPayment(data)
        setMethod(data.type === PaymentType.ONLINE ? "online" : "tunai")
        setMethodLocked(true)
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          // Tidak ada record payment → pesanan offline belum dibayar
          setMethod("tunai")
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchPayment()
  }, [orderId])

  const handleTunaiPay = async (amount: number) => {
    setVerifyLoading(true)
    setVerifyError(null)
    try {
      await paymentService.verifyOffline(orderId, amount)
      onVerified?.()
      onClose()
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      setVerifyError(msg ?? "Gagal verifikasi pembayaran. Coba lagi.")
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-w-sm sm:min-w-xl md:min-w-2xl lg:min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Informasi Pemesanan</p>
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
                {transaction.tableCode}
              </div>
              <div>
                <p className="font-semibold text-sm">{transaction.tableName}</p>
                <p className="text-xs text-muted-foreground">Order #{transaction.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted-foreground">Detail Transaksi</p>
              <hr className="border-foreground/10 my-1" />
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{transaction.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Metode Pembayaran</p>

            <Select
              value={method}
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              disabled={methodLocked || fetchLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      {m.icon}
                      {m.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {fetchLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : method === "online" && payment ? (
              <OnlinePaymentInfo payment={payment} onClose={onClose} />
            ) : (
              <>
                <Numpad total={transaction.total} onPay={handleTunaiPay} loading={verifyLoading} />
                {verifyError && (
                  <p className="text-xs text-destructive text-center -mt-2">{verifyError}</p>
                )}
              </>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
