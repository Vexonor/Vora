import { RadioGroup, RadioGroupItem } from "@/components/animate-ui/components/radix/radio-group"
import { Label } from "@/components/ui/label"
import { CardPosIcon } from "@icons/card-pos"
import { WalletIcon } from "@icons/wallet"
import { MouseEvent } from "react"

interface PaymentTypeSectionProps {
  value: string
  onValueChange: (value: string) => void
}

const PaymentTypeSection = ({ value, onValueChange }: PaymentTypeSectionProps) => {
  const handleItemClick = (e: MouseEvent<HTMLButtonElement>, itemValue: string) => {
    if (value === itemValue) {
      e.preventDefault() // Mencegah behavior native radio button
      onValueChange("")  // Reset value ke kosong
    }
  }
  return (
    <div className="">
      <h3 className="text-base text-foreground font-bold pb-2">Pilih Tipe Pembayaran</h3>
      <RadioGroup value={value} onValueChange={onValueChange}>
        {/* Offline */}
        <div className="flex justify-between items-center gap-3 bg-white border border-foreground/20 rounded-lg px-4 py-6">
          <div className="flex items-center gap-3">
            <WalletIcon className="text-foreground size-5" />
            <Label htmlFor="offline" className="font-semibold">Pembayaran secara offline</Label>
          </div>
          <RadioGroupItem value="offline" id="offline" className="ring-1 ring-primary" onClick={(e) => handleItemClick(e, "offline")} />
        </div>
        {/* Online */}
        <div className="flex justify-between items-center gap-3 bg-white border border-foreground/20 rounded-lg px-4 py-6">
          <div className="flex items-center gap-3">
            <CardPosIcon className="text-foreground size-5" />
            <Label htmlFor="online" className="font-semibold">Pembayaran secara online</Label>
          </div>
          <RadioGroupItem value="online" id="online" className="ring-1 ring-primary" onClick={(e) => handleItemClick(e, "online")} />
        </div>
      </RadioGroup>
    </div>
  )
}

export default PaymentTypeSection