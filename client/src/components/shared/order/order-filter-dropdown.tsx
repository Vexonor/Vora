"use client"

import { OrderStatus } from "@/types/order"
import { SlidersHorizontalIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const STATUS_OPTIONS = [
  { value: OrderStatus.PENDING,    label: "Menunggu",    dotClass: "bg-secondary" },
  { value: OrderStatus.PROCESSING, label: "Diproses",    dotClass: "bg-secondary" },
  { value: OrderStatus.READY,      label: "Siap",        dotClass: "bg-primary" },
  { value: OrderStatus.COMPLETED,  label: "Selesai",     dotClass: "bg-primary" },
  { value: OrderStatus.CANCELED,   label: "Dibatalkan",  dotClass: "bg-destructive" },
]

type Props = {
  selected: number[]
  onApply: (selected: number[]) => void
}

export function OrderFilterDropdown({ selected, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>(selected)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setDraft(selected)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const toggle = (val: number) =>
    setDraft((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val])

  const handleApply = () => {
    onApply(draft)
    setOpen(false)
  }

  const handleReset = () => {
    setDraft([])
    onApply([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`border rounded-lg p-2 transition-colors
          ${open || selected.length > 0
            ? "border-primary text-primary"
            : "border-foreground/30 hover:border-primary text-muted-foreground"
          }`}
      >
        <SlidersHorizontalIcon className="size-4" />
      </button>
      {selected.length > 0 && (
        <span className="absolute -top-1.5 -right-1.5 size-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full pointer-events-none">
          {selected.length}
        </span>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-foreground/10 rounded-xl shadow-lg z-50 p-3 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">
            Status Pesanan
          </p>
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={draft.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="rounded accent-primary"
              />
              <span className={`size-2 rounded-full shrink-0 ${opt.dotClass}`} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-foreground/10">
            <button
              onClick={handleReset}
              className="flex-1 text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 text-xs font-semibold text-white bg-primary py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
