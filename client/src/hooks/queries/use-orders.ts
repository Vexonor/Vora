import { isFinalOrderStatus } from "@/lib/order"
import { flattenUniqueOrders, getNextOrderPageParam, ORDER_PAGE_SIZE } from "@/lib/order-list-page"
import { queryKeys, type OrderListFilters } from "@/lib/query-keys"
import { orderService } from "@/services/order.service"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

export const KITCHEN_ORDER_POLL_INTERVAL_MS = 10_000
const ORDER_STATUS_POLL_INTERVAL_MS = 8_000

export function useOrderList(filters: OrderListFilters, { pollIntervalMs }: { pollIntervalMs?: number } = {}) {
  const orderListQuery = useInfiniteQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: ({ pageParam }) => orderService.getPage({ ...filters, page: pageParam, limit: ORDER_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: getNextOrderPageParam,
    refetchInterval: pollIntervalMs ?? false,
  })
  const orders = useMemo(() => flattenUniqueOrders(orderListQuery.data?.pages ?? []), [orderListQuery.data])
  return { ...orderListQuery, orders }
}

export function useOrderDetail(orderId: number, { pollUntilFinal = false }: { pollUntilFinal?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getById(orderId),
    enabled: Number.isInteger(orderId) && orderId > 0,
    refetchInterval: (query) => {
      if (!pollUntilFinal) return false
      const order = query.state.data
      return order && isFinalOrderStatus(Number(order.status)) ? false : ORDER_STATUS_POLL_INTERVAL_MS
    },
  })
}

export function useRefreshOrderData() {
  const queryClient = useQueryClient()
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
      ]),
    [queryClient],
  )
}

export function useUpdateOrderStatus() {
  const refreshOrderData = useRefreshOrderData()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: number }) =>
      orderService.updateStatus(orderId, { status }),
    onSuccess: refreshOrderData,
  })
}

export function useCancelOrder() {
  const refreshOrderData = useRefreshOrderData()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) => orderService.cancel(orderId, { reason }),
    onSuccess: refreshOrderData,
  })
}
