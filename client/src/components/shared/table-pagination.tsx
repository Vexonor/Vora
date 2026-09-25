import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination-state"

type PageItem = number | "ellipsis"

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const items: PageItem[] = [1]
  if (currentPage > 3) items.push("ellipsis")
  const firstMiddlePage = Math.max(2, currentPage - 1)
  const lastMiddlePage = Math.min(totalPages - 1, currentPage + 1)
  for (let page = firstMiddlePage; page <= lastMiddlePage; page++) items.push(page)
  if (currentPage < totalPages - 2) items.push("ellipsis")
  items.push(totalPages)
  return items
}

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePagination({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-end gap-1 pt-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹ Sebelumnya
      </button>
      {getPageItems(currentPage, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`size-8 rounded-lg text-sm font-medium transition-colors border
              ${currentPage === item
                ? "bg-primary text-white border-primary"
                : "border-foreground/20 hover:border-primary"
              }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="text-sm px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Setelahnya ›
      </button>
    </div>
  )
}

type PageSizeSelectProps = {
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
}

export function PageSizeSelect({ pageSize, onPageSizeChange }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
      <span>Tampilkan</span>
      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
        <SelectTrigger className="h-8 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>baris</span>
    </div>
  )
}

