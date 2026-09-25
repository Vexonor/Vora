import { queryKeys, type SellingReportListFilters } from "@/lib/query-keys"
import { sellingReportService } from "@/services/selling-report.service"
import type { CreateSellingReportRequest } from "@/types/selling-report"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSellingReportList(filters: SellingReportListFilters) {
  return useQuery({
    queryKey: queryKeys.sellingReports.list(filters),
    queryFn: () =>
      sellingReportService.getAll({
        q: filters.search || undefined,
        month: filters.month || undefined,
        year: filters.year || undefined,
      }),
  })
}

function useInvalidateSellingReports() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sellingReports.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all }),
    ])
}

export function useCreateSellingReport() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: (request: CreateSellingReportRequest) => sellingReportService.create(request),
    onSuccess: invalidateSellingReports,
  })
}

export function useUpdateOperationalCost() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: ({ reportId, operationalCost }: { reportId: number; operationalCost: number }) =>
      sellingReportService.updateOperationalCost(reportId, operationalCost),
    onSuccess: invalidateSellingReports,
  })
}

export function useDeleteSellingReport() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: (reportId: number) => sellingReportService.remove(reportId),
    onSuccess: invalidateSellingReports,
  })
}
