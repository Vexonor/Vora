import { getOrderPlace } from "@/lib/order-place"
import type { Order, OrderPage, OrderStatus } from "@/types/order"

export const ORDER_PAGE_SIZE = 20

export function matchesOrderSearch(order: Order, search: string) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return true
  const place = getOrderPlace(order)
  return [place.code, place.name, order.customer_name ?? "", `#${order.id}`]
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch)
}

export function sliceOrderPage(
  orders: Order[],
  { page, limit, search }: { page: number; limit: number; search: string },
): OrderPage {
  const matchingOrders = orders.filter((order) => matchesOrderSearch(order, search))
  const startIndex = (page - 1) * limit
  return {
    orders: matchingOrders.slice(startIndex, startIndex + limit),
    count: matchingOrders.length,
    hasNextPage: startIndex + limit < matchingOrders.length,
  }
}

export function getNextOrderPageParam(lastPage: OrderPage, allPages: OrderPage[]) {
  return lastPage.hasNextPage ? allPages.length + 1 : undefined
}

export function flattenUniqueOrders(pages: OrderPage[]) {
  const seenOrderIds = new Set<number>()
  const uniqueOrders: Order[] = []
  for (const page of pages) {
    for (const order of page.orders) {
      if (seenOrderIds.has(order.id)) continue
      seenOrderIds.add(order.id)
      uniqueOrders.push(order)
    }
  }
  return uniqueOrders
}

export function resolveOrderStatusFilter(tabStatus: OrderStatus | null, dropdownStatuses: number[]) {
  if (dropdownStatuses.length > 0) return [...dropdownStatuses].sort((first, second) => first - second)
  return tabStatus === null ? [] : [tabStatus]
}
