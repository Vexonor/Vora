import { queryKeys } from "@/lib/query-keys"
import { dashboardService } from "@/services/dashboard.service"
import type { ChartPeriod } from "@/types/dashboard"
import { useQuery } from "@tanstack/react-query"

export function useCashierStats() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierStats(), queryFn: dashboardService.getCashierStats })
}

export function useCashierActiveOrders() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierActiveOrders(), queryFn: dashboardService.getActiveOrders })
}

export function useCashierPendingPayments() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierPendingPayments(), queryFn: dashboardService.getPendingPayments })
}

export function useManagerStats() {
  return useQuery({ queryKey: queryKeys.dashboard.managerStats(), queryFn: dashboardService.getManagerStats })
}

export function useManagerChart(period: ChartPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.managerChart(period),
    queryFn: () => dashboardService.getManagerChartData(period),
  })
}
