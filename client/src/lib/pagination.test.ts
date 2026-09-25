import { describe, expect, it } from "vitest"
import { getPaginationView, paginate } from "./pagination"

describe("getPaginationView", () => {
  it("counts pages from the total number of items", () => {
    expect(getPaginationView(1, 10, 25).totalPages).toBe(3)
  })

  it("keeps one page when there are no items", () => {
    expect(getPaginationView(1, 10, 0)).toEqual({ currentPage: 1, totalPages: 1, rowNumberOffset: 0 })
  })

  it("moves back to the last page when the requested page no longer exists", () => {
    expect(getPaginationView(3, 10, 20).currentPage).toBe(2)
  })

  it("never goes below the first page", () => {
    expect(getPaginationView(0, 10, 5).currentPage).toBe(1)
  })

  it("computes the row number offset of the current page", () => {
    expect(getPaginationView(2, 25, 60).rowNumberOffset).toBe(25)
  })
})

describe("paginate", () => {
  it("returns only the items of the requested page", () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4])
  })
})
