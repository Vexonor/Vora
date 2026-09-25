import type { StockListFilters } from "@/lib/query-keys"
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

export function toStockListQuery({ search, statuses, page, pageSize }: StockListFilters) {
  const query: Record<string, string> = {
    page: String(page),
    limit: String(pageSize),
    order_by: "created_at",
    direction: "DESC",
  }
  if (search.trim()) query.q = search.trim()
  if (statuses.length === 1) query.status = String(statuses[0])
  else if (statuses.length > 1) query.status = JSON.stringify(statuses)
  return query
}
