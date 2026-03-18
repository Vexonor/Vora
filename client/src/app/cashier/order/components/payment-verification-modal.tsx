"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Transaction } from "@/lib/constant/order"
import { CreditCard, Delete, Wallet } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type PaymentMethod = "tunai" | "online"

type Props = {
  transaction: Transaction
  onClose: () => void
}

function Numpad({ total, onPay }: { total: number; onPay: (amount: number) => void }) {
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
          >
            {key === "⌫" ? <Delete className="size-4" /> : key}
          </Button>
        ))}
      </div>
      <Button onClick={() => onPay(displayed)} className="w-full bg-secondary text-primary font-semibold rounded-lg py-2">
        Bayar Sekarang
      </Button>
    </div>
  )
}

function UploadProof({ onVerify }: { onVerify: () => void }) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-foreground/20 rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden min-h-[200px]">
        {preview ? (
          <Image
            src={preview}
            alt="Bukti pembayaran"
            width={600}
            height={280}
            className="w-full object-contain max-h-[280px]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
            <CreditCard className="size-10" />
            <p className="text-sm font-medium">Upload bukti pembayaran</p>
            <p className="text-xs">PNG, JPG hingga 5MB</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      <Button onClick={onVerify} disabled={!preview} className="w-full">
        Verifikasi Sekarang
      </Button>
    </div>
  )
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "tunai", label: "Tunai", icon: <Wallet className="size-4" /> },
  { value: "online", label: "Online", icon: <CreditCard className="size-4" /> },
]

export function PaymentVerificationModal({ transaction, onClose }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("tunai")

  const handleAction = () => {
    // TODO: handle API call
    onClose()
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
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                <p className="text-xs text-muted-foreground">{transaction.time}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted-foreground">Detail Transaksi</p>
              <div className="flex flex-col gap-1">
                {transaction.items.map((item) => (
                  <div key={item.name} className="grid grid-cols-3 text-sm">
                    <span>{item.name}</span>
                    <span className="text-center">{item.qty}</span>
                    <span className="text-right">{item.price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              <hr className="border-foreground/10 my-1" />
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{transaction.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>PPN (10%)</span>
                  <span>{transaction.tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{transaction.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Metode Pembayaran</p>

            <Select value={method} onValueChange={(val) => setMethod(val as PaymentMethod)}>
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

            {method === "tunai" ? (
              <Numpad total={transaction.total} onPay={handleAction} />
            ) : (
              <UploadProof onVerify={handleAction} />
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}