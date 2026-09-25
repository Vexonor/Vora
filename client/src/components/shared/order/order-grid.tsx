"use client"

import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { VirtuosoGrid, type GridComponents } from "react-virtuoso"

type OrderGridContext = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasNextPageError: boolean
  onLoadNextPage: () => void
}

function OrderGridFooter({ context }: { context?: OrderGridContext }) {
  if (!context) return null

  if (context.hasNextPageError) {
    return (
      <div className="flex justify-center py-6">
        <button onClick={context.onLoadNextPage} className="text-sm text-primary underline">
          Coba muat lagi
        </button>
      </div>
    )
  }

  if (context.isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memuat pesanan lain…
      </div>
    )
  }

  if (!context.hasNextPage) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Semua pesanan sudah ditampilkan</p>
  }

  return null
}

const ORDER_GRID_COMPONENTS: GridComponents<OrderGridContext> = { Footer: OrderGridFooter }

type Props = {
  orders: Order[]
  gridColumnsClass: string
  renderOrder: (order: Order) => React.ReactNode
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasNextPageError: boolean
  onLoadNextPage: () => void
}

export function OrderGrid({
  orders,
  gridColumnsClass,
  renderOrder,
  hasNextPage,
  isFetchingNextPage,
  hasNextPageError,
  onLoadNextPage,
}: Props) {
  const loadNextPageWhenAvailable = () => {
    if (hasNextPage && !isFetchingNextPage && !hasNextPageError) onLoadNextPage()
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      data={orders}
      computeItemKey={(_, order) => order.id}
      listClassName={`grid ${gridColumnsClass} gap-4`}
      itemContent={(_, order) => renderOrder(order)}
      endReached={loadNextPageWhenAvailable}
      context={{ hasNextPage, isFetchingNextPage, hasNextPageError, onLoadNextPage }}
      components={ORDER_GRID_COMPONENTS}
    />
  )
}
