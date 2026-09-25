import { AxiosError, type AxiosResponse } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

const apiGet = vi.hoisted(() => vi.fn())
vi.mock("./api-client", () => ({ default: { get: apiGet } }))

import { paymentService } from "./payment.service"

const createAxiosErrorWithStatus = (status: number) => {
  const error = new AxiosError()
  error.response = { status } as AxiosResponse
  return error
}

describe("paymentService.findByOrderId", () => {
  beforeEach(() => apiGet.mockReset())

  it("returns null when the order has no payment yet", async () => {
    apiGet.mockRejectedValueOnce(createAxiosErrorWithStatus(404))
    await expect(paymentService.findByOrderId(7)).resolves.toBeNull()
  })

  it("rethrows other failures", async () => {
    apiGet.mockRejectedValueOnce(createAxiosErrorWithStatus(500))
    await expect(paymentService.findByOrderId(7)).rejects.toBeInstanceOf(AxiosError)
  })
})
