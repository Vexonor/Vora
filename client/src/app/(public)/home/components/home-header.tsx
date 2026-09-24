import { Input } from "@/components/ui/input"
import { MagnifyingGlass } from "@icons/magnifying-glass"
import Image from "next/image"

type Props = {
  search: string
  onSearchChange: (value: string) => void
}

export function HomeHeader({ search, onSearchChange }: Props) {
  return (
    <div className="w-full flex items-center gap-4 p-4">
      <div className="flex items-center gap-1">
        <Image
          src="/image/catalog-logo.svg"
          alt="Cat-a Log Logo"
          width={100}
          height={100}
          className="size-12"
        />
      </div>
      <div className="flex grow items-center gap-1 border-2 border-primary px-2 py-1 rounded-xl">
        <MagnifyingGlass className="size-6 text-foreground" />
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  )
}
