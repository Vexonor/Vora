import { cn } from "@/lib/utils"
import { SearchIcon } from "lucide-react"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export function SearchField({ value, onChange, placeholder, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-foreground/30 rounded-lg px-3 py-2 w-52 focus-within:border-primary transition-colors",
        className,
      )}
    >
      <SearchIcon className="size-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
