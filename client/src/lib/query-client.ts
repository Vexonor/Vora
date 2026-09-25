import { QueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

const QUERY_STALE_TIME_MS = 30_000
const MAX_QUERY_RETRIES = 1

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= MAX_QUERY_RETRIES) return false
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === undefined || status >= 500
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
