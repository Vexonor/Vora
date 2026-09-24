import type { CreateStockRequest, Stock } from "@/types/stock"

export type StockFormValues = {
  name: string
  quantity: string
  unitId: string
  minimumQuantity: string
  maximumQuantity: string
}

export function getStockName(stock: Pick<Stock, "id" | "name">) {
  return stock.name ?? `Bahan #${stock.id}`
}

export function toStockFormValues(stock: Stock): StockFormValues {
  return {
    name: stock.name ?? "",
    quantity: String(stock.quantity),
    unitId: String(stock.unit_id),
    minimumQuantity: String(stock.minimum),
    maximumQuantity: String(stock.maximum),
  }
}

export function toStockRequest(values: StockFormValues): CreateStockRequest {
  return {
    name: values.name.trim(),
    unit_id: Number(values.unitId),
    quantity: Number(values.quantity),
    minimum: Number(values.minimumQuantity || 0),
    maximum: Number(values.maximumQuantity || 0),
  }
}
