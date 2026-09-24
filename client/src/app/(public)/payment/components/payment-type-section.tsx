import { RadioGroup, RadioGroupItem } from "@/components/animate-ui/components/radix/radio-group"
import { Label } from "@/components/ui/label"
import { CardPosIcon } from "@icons/card-pos"
import { WalletIcon } from "@icons/wallet"
import type { MouseEvent } from "react"

export type CustomerPaymentType = "online" | "offline"

const PAYMENT_TYPE_OPTIONS: { value: CustomerPaymentType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "offline", label: "Pembayaran secara offline", Icon: WalletIcon },
  { value: "online", label: "Pembayaran secara online", Icon: CardPosIcon },
]

type Props = {
  selectedType: CustomerPaymentType | null
  onSelectedTypeChange: (paymentType: CustomerPaymentType | null) => void
}

export function PaymentTypeSection({ selectedType, onSelectedTypeChange }: Props) {
  const handleOptionClick = (event: MouseEvent<HTMLButtonElement>, paymentType: CustomerPaymentType) => {
    if (selectedType !== paymentType) return
    event.preventDefault()
    onSelectedTypeChange(null)
  }

  return (
    <div>
      <h3 className="text-base text-foreground font-bold pb-2">Pilih Tipe Pembayaran</h3>
      <RadioGroup
        value={selectedType ?? ""}
        onValueChange={(paymentType) => onSelectedTypeChange(paymentType as CustomerPaymentType)}
      >
        {PAYMENT_TYPE_OPTIONS.map(({ value, label, Icon }) => (
          <div key={value} className="flex justify-between items-center gap-3 bg-white border border-foreground/20 rounded-lg px-4 py-6">
            <div className="flex items-center gap-3">
              <Icon className="text-foreground size-5" />
              <Label htmlFor={`payment-type-${value}`} className="font-semibold">{label}</Label>
            </div>
            <RadioGroupItem
              value={value}
              id={`payment-type-${value}`}
              className="ring-1 ring-primary"
              onClick={(event) => handleOptionClick(event, value)}
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
