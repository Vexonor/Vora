import { buildOrder } from "@/test/build-order"
import { OrderStatus, OrderType } from "@/types/order"
import { describe, expect, it } from "vitest"
import {
  flattenUniqueOrders,
  getNextOrderPageParam,
  matchesOrderSearch,
  resolveOrderStatusFilter,
  sliceOrderPage,
} from "./order-list-page"

describe("matchesOrderSearch", () => {
  it("matches every order when the search is blank", () => {
    expect(matchesOrderSearch(buildOrder(1), "   ")).toBe(true)
  })

  it("matches the table code and table name regardless of case", () => {
    const order = buildOrder(1, { table_id: 7 })
    expect(matchesOrderSearch(order, "t-07")).toBe(true)
    expect(matchesOrderSearch(order, "MEJA 07")).toBe(true)
  })

  it("matches the customer name", () => {
    expect(matchesOrderSearch(buildOrder(1, { customer_name: "Budi Santoso" }), "budi")).toBe(true)
  })

  it("matches the order number written with a hash", () => {
    expect(matchesOrderSearch(buildOrder(42), "#42")).toBe(true)
  })

  it("matches take away orders by their label", () => {
    const takeAwayOrder = buildOrder(1, { table_id: null, order_type: OrderType.TAKE_AWAY })
    expect(matchesOrderSearch(takeAwayOrder, "take away")).toBe(true)
  })

  it("rejects orders that do not contain the search text", () => {
    expect(matchesOrderSearch(buildOrder(1, { customer_name: "Budi" }), "siti")).toBe(false)
  })
})

describe("sliceOrderPage", () => {
  const orders = Array.from({ length: 45 }, (_, index) => buildOrder(index + 1))

  it("returns the requested page and reports that more pages exist", () => {
    const page = sliceOrderPage(orders, { page: 2, limit: 20, search: "" })
    expect(page.orders.map((order) => order.id)).toEqual(Array.from({ length: 20 }, (_, index) => index + 21))
    expect(page.count).toBe(45)
    expect(page.hasNextPage).toBe(true)
  })

  it("reports no next page on the last page", () => {
    const page = sliceOrderPage(orders, { page: 3, limit: 20, search: "" })
    expect(page.orders).toHaveLength(5)
    expect(page.hasNextPage).toBe(false)
  })

  it("counts only the orders that match the search", () => {
    const namedOrders = [buildOrder(1, { customer_name: "Budi" }), buildOrder(2, { customer_name: "Siti" })]
    const page = sliceOrderPage(namedOrders, { page: 1, limit: 20, search: "siti" })
    expect(page.count).toBe(1)
    expect(page.orders[0].id).toBe(2)
  })
})

describe("getNextOrderPageParam", () => {
  it("asks for the page after the pages already loaded", () => {
    const firstPage = { orders: [], count: 40, hasNextPage: true }
    expect(getNextOrderPageParam(firstPage, [firstPage])).toBe(2)
  })

  it("stops when the last page has no next page", () => {
    const lastPage = { orders: [], count: 10, hasNextPage: false }
    expect(getNextOrderPageParam(lastPage, [lastPage])).toBeUndefined()
  })
})

describe("flattenUniqueOrders", () => {
  it("keeps the first copy when an order appears on two pages", () => {
    const pages = [
      { orders: [buildOrder(3), buildOrder(2)], count: 4, hasNextPage: true },
      { orders: [buildOrder(2), buildOrder(1)], count: 4, hasNextPage: false },
    ]
    expect(flattenUniqueOrders(pages).map((order) => order.id)).toEqual([3, 2, 1])
  })
})

describe("resolveOrderStatusFilter", () => {
  it("uses the dropdown selection over the tab and sorts it", () => {
    expect(resolveOrderStatusFilter(OrderStatus.PENDING, [OrderStatus.READY, OrderStatus.PROCESSING])).toEqual([
      OrderStatus.PROCESSING,
      OrderStatus.READY,
    ])
  })

  it("uses the tab status when the dropdown is empty", () => {
    expect(resolveOrderStatusFilter(OrderStatus.READY, [])).toEqual([OrderStatus.READY])
  })

  it("returns no filter for the all tab", () => {
    expect(resolveOrderStatusFilter(null, [])).toEqual([])
  })
})
