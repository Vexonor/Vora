"use client"

import { TONE_SOLID_CLASS, type StatusTone } from "@/lib/status-tone"
import { SlidersHorizontalIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type FilterOption = {
  value: number
  label: string
  tone: StatusTone
}

type Props = {
  title: string
  options: FilterOption[]
  selectedValues: number[]
  onApply: (selectedValues: number[]) => void
}

export function FilterDropdown({ title, options, selectedValues, onApply }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftValues, setDraftValues] = useState<number[]>(selectedValues)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [isOpen])

  const handleToggleOpen = () => {
    if (!isOpen) setDraftValues(selectedValues)
    setIsOpen(!isOpen)
  }

  const toggleDraftValue = (value: number) =>
    setDraftValues((previous) =>
      previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value],
    )

  const handleApply = () => {
    onApply(draftValues)
    setIsOpen(false)
  }

  const handleReset = () => {
    setDraftValues([])
    onApply([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggleOpen}
        className={`border rounded-lg p-2 transition-colors
          ${isOpen || selectedValues.length > 0
            ? "border-primary text-primary"
            : "border-foreground/30 hover:border-primary text-muted-foreground"
          }`}
      >
        <SlidersHorizontalIcon className="size-4" />
      </button>
      {selectedValues.length > 0 && (
        <span className="absolute -top-1.5 -right-1.5 size-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full pointer-events-none">
          {selectedValues.length}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-foreground/10 rounded-xl shadow-lg z-50 p-3 flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">
            {title}
          </p>
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={draftValues.includes(option.value)}
                onChange={() => toggleDraftValue(option.value)}
                className="rounded accent-primary"
              />
              <span className={`size-2 rounded-full shrink-0 ${TONE_SOLID_CLASS[option.tone]}`} />
              <span className="text-sm">{option.label}</span>
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
