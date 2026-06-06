import { ChevronLeftIcon } from "@icons/chevron-left"
import Link from "next/link"

const Header = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <ChevronLeftIcon className="text-foreground size-6" />
      <span className="text-base font-medium">Kembali</span>
    </Link>
  )
}

export default Header