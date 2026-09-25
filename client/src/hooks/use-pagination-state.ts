import { useState } from "react"

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 10

export function usePaginationState() {
  const [requestedPage, setRequestedPage] = useState(1)
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE)

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize)
    setRequestedPage(1)
  }

  return {
    requestedPage,
    pageSize,
    setRequestedPage,
    setPageSize,
    resetToFirstPage: () => setRequestedPage(1),
  }
}
