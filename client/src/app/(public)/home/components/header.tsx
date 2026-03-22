import { Input } from "@/components/ui/input"
import { MagnifyingGlass } from "@icons/magnifying-glass"
import Image from "next/image"

const Header = () => {
  return (
    <div className="w-full flex items-center gap-4 p-4">
      {/* Brand */}
      <div className="flex items-center gap-1">
        <Image
          src="/image/app-logo.svg"
          alt="Vora Logo"
          width={100}
          height={100}
          className="size-12"
        />
        <h1 className="text-xl text-primary font-black">Vora</h1>
      </div>
      {/* Search Input */}
      <div className="flex grow items-center gap-1 border-2 border-primary px-2 py-1 rounded-xl">
        <MagnifyingGlass className="size-6 text-foreground" />
        <Input
          placeholder="Cari menu..."
          className=""
        />
      </div>
    </div>
  )
}

export default Header