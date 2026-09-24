import { useCallback, useRef } from "react"

export function useLatestRequest() {
  const latestRequestIdRef = useRef(0)

  return useCallback(() => {
    const requestId = ++latestRequestIdRef.current
    return () => requestId === latestRequestIdRef.current
  }, [])
}
