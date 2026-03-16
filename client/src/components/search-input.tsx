import { MagnifyingGlass } from "@icons/magnifying-glass";

export function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center gap-2 border border-primary rounded-lg px-3 py-2">
      <MagnifyingGlass className="size-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}