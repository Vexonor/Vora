"use client"

import { Fragment, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { paymentService } from "@/services/payment.service"
import type { OrderItem } from "@/types/order"
import type { CashPaymentResult, Payment } from "@/types/payment"
import { PaymentType } from "@/types/payment"
import { CheckCircle, Clock, CreditCard, Delete, Loader2, Wallet } from "lucide-react"
import Image from "next/image"

type PaymentMethod = "tunai" | "online"

type TransactionSummary = {
  id: string
  placeCode: string
  placeName: string
  total: number
  items: OrderItem[]
}

type Props = {
  transaction: TransactionSummary
  orderId: number
  onClose: () => void
  onVerified?: () => void
}

const rupiah = (value: number) => `Rp. ${value.toLocaleString("id-ID")}`

function Numpad({ total, onPay, loading }: { total: number; onPay: (amount: number) => void; loading: boolean }) {
  const [input, setInput] = useState("")

  const displayed = input === "" ? total : parseInt(input)
  // Kembalian hanya pratinjau di layar. Server tetap menghitung dan
  // memvalidasi ulang nilainya saat verifikasi.
  const difference = displayed - total
  const isShort = difference < 0

  const press = (val: string) => {
    if (val === "⌫") return setInput((p) => p.slice(0, -1))
    if (val === "000") return setInput((p) => (p === "" ? "" : p + "000"))
    if (val === "0" && input === "") return
    setInput((p) => p + val)
  }

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-center text-xs text-muted-foreground">Uang Diterima</p>
        <p className={`text-center text-2xl font-bold ${isShort ? "text-destructive" : "text-foreground"}`}>
          {rupiah(displayed)}
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span className="font-medium">{rupiah(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{isShort ? "Kurang" : "Kembalian"}</span>
          <span className={`font-bold ${isShort ? "text-destructive" : difference > 0 ? "text-green-600" : "text-foreground"}`}>
            {rupiah(Math.abs(difference))}
          </span>
        </div>
      </div>

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

      {isShort && (
        <p className="text-xs text-destructive text-center">
          Uang yang diterima kurang {rupiah(Math.abs(difference))} dari total tagihan.
        </p>
      )}

      <Button
        onClick={() => onPay(displayed)}
        disabled={loading || isShort}
        className="w-full bg-secondary text-primary font-semibold rounded-lg py-2"
      >
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
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
        <p className="text-4xl font-bold text-green-600">{rupiah(result.change_amount)}</p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Tagihan</span>
          <span className="font-medium">{rupiah(result.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uang Diterima</span>
          <span className="font-medium">{rupiah(result.paid)}</span>
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

function NoOnlinePaymentInfo({ onClose }: { onClose: () => void }) {
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
  const [cashResult, setCashResult] = useState<CashPaymentResult | null>(null)

  // Sebagian endpoint mengembalikan order tanpa relasi items, jadi tetap dijaga.
  const items = transaction.items ?? []
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0)

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
      const result = await paymentService.verifyOffline(orderId, amount)
      // Modal tidak langsung ditutup — kasir perlu membaca nominal kembalian dulu.
      setCashResult(result)
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      setVerifyError(msg ?? "Gagal verifikasi pembayaran. Coba lagi.")
    } finally {
      setVerifyLoading(false)
    }
  }

  // Refresh daftar pesanan ditunda sampai modal ditutup. Kalau dipanggil tepat
  // setelah verifikasi, order lunas langsung hilang dari daftar pending dan
  // modalnya ikut ter-unmount sebelum kasir sempat membaca kembaliannya.
  const handleClose = () => {
    if (cashResult) onVerified?.()
    onClose()
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
              <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
                {transaction.placeCode}
              </div>
              <div>
                <p className="font-semibold text-sm">{transaction.placeName}</p>
                <p className="text-xs text-muted-foreground">
                  Order #{transaction.id} · {itemCount} item
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted-foreground">Detail Transaksi</p>
              <hr className="border-foreground/10 my-1" />

              {/* Header dan seluruh baris berbagi satu grid agar kolomnya sejajar. */}
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
                      {/* Nama panjang dibiarkan turun baris, bukan dipotong — kasir
                          perlu membaca menunya utuh. min-w-0 menahan kolom 1fr agar
                          tidak melebar dan mendorong kolom angka. */}
                      <span className="min-w-0 wrap-break-word text-sm py-1 leading-snug">
                        {item.menu?.name ?? `Menu #${item.menu_id}`}
                      </span>
                      <span className="text-sm py-1 leading-snug text-center tabular-nums whitespace-nowrap">
                        {item.quantity}
                      </span>
                      <span className="text-sm py-1 leading-snug text-right tabular-nums whitespace-nowrap text-muted-foreground">
                        {rupiah(Number(item.price))}
                      </span>
                      <span className="text-sm py-1 leading-snug text-right tabular-nums whitespace-nowrap font-medium">
                        {rupiah(Number(item.total_price))}
                      </span>
                    </Fragment>
                  ))
                )}
              </div>

              <hr className="border-foreground/10 my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{rupiah(transaction.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Metode Pembayaran</p>

            <Select
              value={method}
              onValueChange={(val) => setMethod(val as PaymentMethod)}
              disabled={methodLocked || fetchLoading || cashResult !== null}
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
            ) : method === "tunai" ? (
              // Numpad dan kembalian hanya milik alur tunai.
              cashResult ? (
                <CashPaymentSuccess result={cashResult} onClose={handleClose} />
              ) : (
                <>
                  <Numpad total={transaction.total} onPay={handleTunaiPay} loading={verifyLoading} />
                  {verifyError && (
                    <p className="text-xs text-destructive text-center -mt-2">{verifyError}</p>
                  )}
                </>
              )
            ) : payment ? (
              <OnlinePaymentInfo payment={payment} onClose={handleClose} />
            ) : (
              <NoOnlinePaymentInfo onClose={handleClose} />
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
