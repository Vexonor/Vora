import { describe, expect, it, vi } from "vitest"
import { createTimedPromiseCache } from "./timed-promise-cache"

describe("createTimedPromiseCache", () => {
  it("reuses the cached value before the time limit", async () => {
    let currentTime = 0
    const cache = createTimedPromiseCache<number>(5000, () => currentTime)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    currentTime = 4999
    await cache.load("orders", loader)

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it("loads again once the time limit has passed", async () => {
    let currentTime = 0
    const cache = createTimedPromiseCache<number>(5000, () => currentTime)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    currentTime = 5000
    await cache.load("orders", loader)

    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("always loads again when forceRefresh is set", async () => {
    const cache = createTimedPromiseCache<number>(5000, () => 0)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    await cache.load("orders", loader, { forceRefresh: true })

    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("does not keep a failed load", async () => {
    const cache = createTimedPromiseCache<number>(5000, () => 0)
    const loader = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(2)

    await expect(cache.load("orders", loader)).rejects.toThrow("offline")
    await expect(cache.load("orders", loader)).resolves.toBe(2)
  })

  it("keeps a separate entry for each key", async () => {
    const cache = createTimedPromiseCache<string>(5000, () => 0)

    await cache.load("pending", async () => "pending orders")
    const processingOrders = await cache.load("processing", async () => "processing orders")

    expect(processingOrders).toBe("processing orders")
  })
})
