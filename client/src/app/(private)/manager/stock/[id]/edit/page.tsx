"use client"

import { StockEditView } from "@/components/shared/stock/stock-edit-view"
import { use } from "react"

export default function ManagerStockEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <StockEditView
      id={Number(id)}
      backPath={`/manager/stock/${id}`}
    />
  )
}
