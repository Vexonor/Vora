"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/animate-ui/components/radix/toggle-group"
import Image from "next/image"

interface PaymentMethodProps {
  value: string
  onValueChange: (value: string) => void
}

const PaymentMethodSection = ({ value, onValueChange }: PaymentMethodProps) => {
  // Maps to Midtrans `enabled_payments` IDs. Hanya channel yang lazim aktif
  // di akun Midtrans (sandbox) & punya logo yang benar.
  const paymentMethod = [
    { id: "qris", name: "QRIS", src: "/assets/brand-logo/qris.svg" },
    { id: "gopay", name: "GoPay", src: "/assets/brand-logo/gopay.svg" },
    { id: "bni_va", name: "BNI", src: "/assets/brand-logo/bni.svg" },
    { id: "bri_va", name: "BRI", src: "/assets/brand-logo/bri.svg" },
    { id: "echannel", name: "Mandiri", src: "/assets/brand-logo/mandiri.svg" },
  ]
  return (
    <div className="min-h-[200px]">
      <h3 className="text-base text-foreground font-bold pb-2">Pilih Metode Pembayaran</h3>
      <ToggleGroup type="single" className="grid grid-cols-3 gap-1" value={value} onValueChange={onValueChange}>
        {paymentMethod.map((item) => (
          <ToggleGroupItem key={item.id} value={item.id} aria-label={item.name} className="flex justify-center items-center size-full">
            <Image
              src={item.src}
              alt={item.name}
              width={100}
              height={100}
              className="size-16"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default PaymentMethodSection