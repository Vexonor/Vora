"use client"

import { StockDetailView } from "@/components/shared/stock/stock-detail-view"
import { use } from "react"

export default function KitchenStockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <StockDetailView
      id={Number(id)}
      backPath="/kitchen/stock"
      editPath={`/kitchen/stock/${id}/edit`}
    />
  )
}
