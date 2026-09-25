import { AxiosError, type AxiosResponse } from "axios"
import { describe, expect, it } from "vitest"
import { shouldRetryQuery } from "./query-client"

const buildAxiosError = (status?: number) =>
  new AxiosError(
    "Request failed",
    status ? "ERR_BAD_RESPONSE" : "ERR_NETWORK",
    undefined,
    undefined,
    status ? ({ status } as AxiosResponse) : undefined,
  )

describe("shouldRetryQuery", () => {
  it("retries a network error once", () => {
    expect(shouldRetryQuery(0, buildAxiosError())).toBe(true)
    expect(shouldRetryQuery(1, buildAxiosError())).toBe(false)
  })

  it("retries a server error once", () => {
    expect(shouldRetryQuery(0, buildAxiosError(503))).toBe(true)
  })

  it("does not retry client errors", () => {
    expect(shouldRetryQuery(0, buildAxiosError(404))).toBe(false)
    expect(shouldRetryQuery(0, buildAxiosError(401))).toBe(false)
  })

  it("does not retry errors that are not from a request", () => {
    expect(shouldRetryQuery(0, new Error("bug"))).toBe(false)
  })
})
