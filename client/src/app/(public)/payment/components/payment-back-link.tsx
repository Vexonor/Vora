import { ChevronLeftIcon } from "@/components/icons/chevron-left"
import Link from "next/link"

export function PaymentBackLink() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <ChevronLeftIcon className="text-foreground size-6" />
      <span className="text-base font-medium">Kembali</span>
    </Link>
  )
}
