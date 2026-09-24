import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  href: string
  label?: string
}

export function BackLink({ href, label = "Kembali" }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
    >
      <ArrowLeftIcon className="size-4" />
      {label}
    </Link>
  )
}
