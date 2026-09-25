import { OrderStatus } from "@/types/order"
import { describe, expect, it } from "vitest"
import { isFinalOrderStatus } from "./order"

describe("isFinalOrderStatus", () => {
  it("treats completed and canceled orders as final", () => {
    expect(isFinalOrderStatus(OrderStatus.COMPLETED)).toBe(true)
    expect(isFinalOrderStatus(OrderStatus.CANCELED)).toBe(true)
  })

  it("keeps active orders polling", () => {
    expect(isFinalOrderStatus(OrderStatus.PENDING)).toBe(false)
    expect(isFinalOrderStatus(OrderStatus.READY)).toBe(false)
  })
})
