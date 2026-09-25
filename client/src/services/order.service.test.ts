import { buildOrder } from "@/test/build-order"
import { OrderStatus } from "@/types/order"
import { beforeEach, describe, expect, it, vi } from "vitest"

const apiGet = vi.hoisted(() => vi.fn())
vi.mock("./api-client", () => ({ default: { get: apiGet } }))

import { orderService } from "./order.service"

const pendingOrders = Array.from({ length: 25 }, (_, index) => buildOrder(index + 1))

describe("orderService.getPage", () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiGet.mockResolvedValue(pendingOrders)
  })

  it("loads the first page from the server every time", async () => {
    const params = { page: 1, limit: 20, statuses: [OrderStatus.PENDING], search: "" }

    await orderService.getPage(params)
    await orderService.getPage(params)

    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it("serves later pages from the list loaded for the first page", async () => {
    const statuses = [OrderStatus.PROCESSING]

    await orderService.getPage({ page: 1, limit: 20, statuses, search: "" })
    const secondPage = await orderService.getPage({ page: 2, limit: 20, statuses, search: "" })

    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(secondPage.orders.map((order) => order.id)).toEqual([21, 22, 23, 24, 25])
    expect(secondPage.hasNextPage).toBe(false)
  })

  it("sends the status filter to the server", async () => {
    await orderService.getPage({ page: 1, limit: 20, statuses: [OrderStatus.READY], search: "" })

    expect(apiGet).toHaveBeenCalledWith("/orders", { params: { status: JSON.stringify([OrderStatus.READY]) } })
  })
})
