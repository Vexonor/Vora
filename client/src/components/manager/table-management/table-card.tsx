"use client"

import { formatTableCode } from "@/lib/order-place"
import type { Table } from "@/types/table"
import { DownloadIcon, Trash2Icon } from "lucide-react"
import { useRef } from "react"
import QRCode from "react-qr-code"

type Props = {
  table: Table
  onDelete: (table: Table) => void
}

const QR_DOWNLOAD_SIZE_PX = 300

export function TableCard({ table, onDelete }: Props) {
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const tableCode = formatTableCode(table.number)
  const orderPageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?table=${table.id}`

  const handleDownloadQrCode = () => {
    const qrSvgElement = qrContainerRef.current?.querySelector("svg")
    if (!qrSvgElement) return

    const svgMarkup = new XMLSerializer().serializeToString(qrSvgElement)
    const svgObjectUrl = URL.createObjectURL(new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }))
    const canvas = document.createElement("canvas")
    const qrImage = new Image()

    qrImage.onload = () => {
      canvas.width = QR_DOWNLOAD_SIZE_PX
      canvas.height = QR_DOWNLOAD_SIZE_PX
      canvas.getContext("2d")?.drawImage(qrImage, 0, 0, QR_DOWNLOAD_SIZE_PX, QR_DOWNLOAD_SIZE_PX)
      URL.revokeObjectURL(svgObjectUrl)
      const downloadLink = document.createElement("a")
      downloadLink.download = `QR-${tableCode}.png`
      downloadLink.href = canvas.toDataURL("image/png")
      downloadLink.click()
    }
    qrImage.src = svgObjectUrl
  }

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-4 flex flex-col items-center gap-3">

      <div className="flex items-center justify-between w-full">
        <span className="font-semibold text-sm">{tableCode}</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
          Aktif
        </span>
      </div>

      <div
        ref={qrContainerRef}
        className="bg-muted rounded-lg p-3 flex items-center justify-center"
      >
        <QRCode
          value={orderPageUrl}
          size={80}
          bgColor="transparent"
          fgColor="#8A4A22"
        />
      </div>

      <p className="text-[10px] text-muted-foreground text-center truncate w-full px-1">
        {orderPageUrl}
      </p>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownloadQrCode}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
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