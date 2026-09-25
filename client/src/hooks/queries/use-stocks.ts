import { queryKeys, type StockListFilters } from "@/lib/query-keys"
import { toStockListQuery } from "@/lib/stock"
import { stockService } from "@/services/stock.service"
import type { CreateStockRequest } from "@/types/stock"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useStockList(filters: StockListFilters) {
  return useQuery({
    queryKey: queryKeys.stocks.list(filters),
    queryFn: () => stockService.getAll(toStockListQuery(filters)),
    placeholderData: keepPreviousData,
  })
}

export function useStockDetail(stockId: number) {
  return useQuery({
    queryKey: queryKeys.stocks.detail(stockId),
    queryFn: () => stockService.getById(stockId),
  })
}

function useInvalidateStocks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all })
}

export function useCreateStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: (request: CreateStockRequest) => stockService.create(request),
    onSuccess: invalidateStocks,
  })
}

export function useUpdateStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: ({ stockId, request }: { stockId: number; request: CreateStockRequest }) =>
      stockService.update(stockId, request),
    onSuccess: invalidateStocks,
  })
}

export function useDeleteStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: (stockId: number) => stockService.remove(stockId),
    onSuccess: invalidateStocks,
  })
}
