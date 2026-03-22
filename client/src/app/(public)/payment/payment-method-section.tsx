"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/animate-ui/components/radix/toggle-group"
import Image from "next/image"

const PaymentMethodSection = () => {
  const paymentMethod = [
    { id: 1, name: "BNI", src: "/assets/brand-logo/bni.svg" },
    { id: 2, name: "Mandiri", src: "/assets/brand-logo/mandiri.svg" },
    { id: 3, name: "BRI", src: "/assets/brand-logo/bri.svg" },
    { id: 4, name: "Gopay", src: "/assets/brand-logo/gopay.svg" },
    { id: 5, name: "Dana", src: "/assets/brand-logo/dana.svg" },
    { id: 6, name: "QRIS", src: "/assets/brand-logo/qris.svg" },
  ]
  return (
    <div className="min-h-[200px]">
      <h3 className="text-base text-foreground font-bold pb-2">Pilih Metode Pembayaran</h3>
      <ToggleGroup type="single" className="grid grid-cols-3 gap-1">
        {paymentMethod.map((item) => (
          <ToggleGroupItem key={item.id} value={item.id.toString()} aria-label={item.name} className="flex justify-center items-center size-full">
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