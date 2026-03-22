"use client"

import { Table, TABLE_STATUS_CONFIG } from "@/lib/constant/table"
import { DownloadIcon, Trash2Icon } from "lucide-react"
import { useRef } from "react"
import QRCode from "react-qr-code"

type Props = {
  table: Table
  onDelete: (table: Table) => void
}

export function TableCard({ table, onDelete }: Props) {
  const qrRef = useRef<HTMLDivElement>(null)
  const config = TABLE_STATUS_CONFIG[table.status]
  const isActive = table.status === "aktif"

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = 300
      canvas.height = 300
      ctx?.drawImage(img, 0, 0, 300, 300)
      URL.revokeObjectURL(url)
      const a = document.createElement("a")
      a.download = `QR-${table.tableCode}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = url
  }

  return (
    <div className={`bg-white rounded-xl border border-foreground/10 p-4 flex flex-col items-center gap-3 transition-opacity ${!isActive ? "opacity-60" : ""}`}>

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="font-semibold text-sm">{table.tableCode}</span>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* QR Code */}
      <div
        ref={qrRef}
        className={`bg-muted rounded-lg p-3 flex items-center justify-center ${!isActive ? "grayscale" : ""}`}
      >
        <QRCode
          value={table.qrValue}
          size={80}
          bgColor="transparent"
          fgColor={isActive ? "#056A68" : "#888888"}
        />
      </div>

      {/* URL hint */}
      <p className="text-[10px] text-muted-foreground text-center truncate w-full px-1">
        {table.qrValue}
      </p>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          disabled={!isActive}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="size-3.5" />
          Unduh
        </button>
        <button
          onClick={() => onDelete(table)}
          className="size-8 flex items-center justify-center rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors shrink-0"
        >
          <Trash2Icon className="size-3.5 text-destructive" />
        </button>
      </div>

    </div>
  )
}