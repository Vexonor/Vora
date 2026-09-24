"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/animate-ui/components/radix/toggle-group"
import Image from "next/image"

const ONLINE_PAYMENT_METHODS = [
  { midtransId: "qris", name: "QRIS", logoPath: "/assets/brand-logo/qris.svg" },
  { midtransId: "gopay", name: "GoPay", logoPath: "/assets/brand-logo/gopay.svg" },
  { midtransId: "bni_va", name: "BNI", logoPath: "/assets/brand-logo/bni.svg" },
  { midtransId: "bri_va", name: "BRI", logoPath: "/assets/brand-logo/bri.svg" },
  { midtransId: "echannel", name: "Mandiri", logoPath: "/assets/brand-logo/mandiri.svg" },
]

type Props = {
  selectedMethod: string
  onSelectedMethodChange: (midtransId: string) => void
}

export function OnlinePaymentMethodSection({ selectedMethod, onSelectedMethodChange }: Props) {
  return (
    <div className="min-h-[200px]">
      <h3 className="text-base text-foreground font-bold pb-2">Pilih Metode Pembayaran</h3>
      <ToggleGroup
        type="single"
        className="grid grid-cols-3 gap-1"
        value={selectedMethod}
        onValueChange={onSelectedMethodChange}
      >
        {ONLINE_PAYMENT_METHODS.map((method) => (
          <ToggleGroupItem
            key={method.midtransId}
            value={method.midtransId}
            aria-label={method.name}
            className="flex justify-center items-center size-full"
          >
            <Image src={method.logoPath} alt={method.name} width={100} height={100} className="size-16" />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
