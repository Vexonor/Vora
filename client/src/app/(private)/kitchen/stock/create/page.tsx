"use client"

import { CreateStockForm, StockForm } from "@/components/shared/stock/create-stock-form"
import { useRouter } from "next/navigation"

export default function KitchenCreateStockPage() {
  const router = useRouter()

  const handleSubmit = (form: StockForm) => {
    // TODO: API call kitchen
    router.push("/kitchen/stock")
  }

  return <CreateStockForm onSubmit={handleSubmit} />
}