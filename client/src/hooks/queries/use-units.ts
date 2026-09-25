import { queryKeys } from "@/lib/query-keys"
import { unitService } from "@/services/unit.service"
import type { CreateUnitRequest } from "@/types/unit"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useUnitList() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: () => unitService.getAll({ order_by: "created_at", direction: "DESC" }),
  })
}

function useInvalidateUnits() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
}

export function useSaveUnit() {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: ({ unitId, request }: { unitId: number | null; request: CreateUnitRequest }) =>
      unitId === null ? unitService.create(request) : unitService.update(unitId, request),
    onSuccess: invalidateUnits,
  })
}

export function useDeleteUnit() {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (unitId: number) => unitService.remove(unitId),
    onSuccess: invalidateUnits,
  })
}
