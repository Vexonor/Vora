import { queryKeys } from "@/lib/query-keys"
import { tableService } from "@/services/table.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useTableList() {
  return useQuery({
    queryKey: queryKeys.tables.list(),
    queryFn: () => tableService.getAll({ order_by: "created_at", direction: "DESC" }),
  })
}

function useInvalidateTables() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ])
}

export function useCreateTable() {
  const invalidateTables = useInvalidateTables()
  return useMutation({
    mutationFn: (tableNumber: number) => tableService.create({ number: tableNumber }),
    onSuccess: invalidateTables,
  })
}

export function useDeleteTable() {
  const invalidateTables = useInvalidateTables()
  return useMutation({
    mutationFn: (tableId: number) => tableService.remove(tableId),
    onSuccess: invalidateTables,
  })
}
