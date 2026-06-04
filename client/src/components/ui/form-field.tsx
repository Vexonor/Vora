import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
  labelClassName?: string
}

export function FormField({ label, error, children, className, labelClassName }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className={cn("font-medium", labelClassName)}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
