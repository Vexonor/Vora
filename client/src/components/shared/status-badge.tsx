import { TONE_SOFT_CLASS, type StatusTone } from "@/lib/status-tone"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  tone: StatusTone
  icon?: React.ReactNode
  className?: string
}

export function StatusBadge({ label, tone, icon, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border",
        TONE_SOFT_CLASS[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  )
}
