"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/animate-ui/components/radix/toggle-group"
import Image from "next/image"

interface PaymentMethodProps {
  value: string
  onValueChange: (value: string) => void
}

const PaymentMethodSection = ({ value, onValueChange }: PaymentMethodProps) => {
  // Mapping to Midtrans payment method IDs
  const paymentMethod = [
    { id: "bni_va", name: "BNI", src: "/assets/brand-logo/bni.svg" },
    { id: "echannel", name: "Mandiri", src: "/assets/brand-logo/mandiri.svg" },
    { id: "bri_va", name: "BRI", src: "/assets/brand-logo/bri.svg" },
    { id: "gopay", name: "Gopay", src: "/assets/brand-logo/gopay.svg" },
    { id: "shopeepay", name: "ShopeePay", src: "/assets/brand-logo/dana.svg" }, // Assuming Dana maps to Shopeepay or similar if not supported directly, or we can use qris
    { id: "qris", name: "QRIS", src: "/assets/brand-logo/qris.svg" },
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