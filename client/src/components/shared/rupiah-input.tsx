import { Input } from "@/components/ui/input"
import { formatThousands, stripNonDigits } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (digits: string) => void
  placeholder?: string
  hasError?: boolean
}

export function RupiahInput({ value, onChange, placeholder, hasError }: Props) {
  return (
    <div
      className={cn(
        "flex items-center border rounded-md overflow-hidden transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        hasError ? "border-destructive" : "border-input",
      )}
    >
      <span className="px-3 text-sm text-muted-foreground border-r border-input bg-muted h-full flex items-center">Rp.</span>
      <Input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={formatThousands(value)}
        onChange={(event) => onChange(stripNonDigits(event.target.value))}
        aria-invalid={hasError}
        className="border-0 rounded-none focus-visible:ring-0 shadow-none"
      />
    </div>
  )
}
