import { StockStatus } from "@/types/stock"
import { describe, expect, it } from "vitest"
import { toStockListQuery } from "./stock"

const baseFilters = { search: "", statuses: [], page: 2, pageSize: 25 }

describe("toStockListQuery", () => {
  it("sends paging and newest-first ordering", () => {
    expect(toStockListQuery(baseFilters)).toEqual({
      page: "2",
      limit: "25",
      order_by: "created_at",
      direction: "DESC",
    })
  })

  it("sends the trimmed search text", () => {
    expect(toStockListQuery({ ...baseFilters, search: "  gula " }).q).toBe("gula")
  })

  it("sends a single status as a plain number", () => {
    expect(toStockListQuery({ ...baseFilters, statuses: [StockStatus.LOW_STOCK] }).status).toBe("2")
  })

  it("sends several statuses as a JSON array", () => {
    const query = toStockListQuery({ ...baseFilters, statuses: [StockStatus.IN_STOCK, StockStatus.LOW_STOCK] })
    expect(query.status).toBe("[1,2]")
  })
})
