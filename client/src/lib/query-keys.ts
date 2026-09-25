import type { ChartPeriod } from "@/types/dashboard"
import type { MetricKey } from "@/types/selling-trend"

export type OrderListFilters = { statuses: number[]; search: string }
export type StockListFilters = { search: string; statuses: number[]; page: number; pageSize: number }
export type MenuListFilters = { search: string; statuses: number[] }
export type StaffListFilters = { search: string; roles: number[] }
export type SellingReportListFilters = { search: string; month: string; year: string }

export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    list: (filters: OrderListFilters) => ["orders", "list", filters] as const,
    detail: (orderId: number) => ["orders", "detail", orderId] as const,
  },
  payments: {
    all: ["payments"] as const,
    byOrder: (orderId: number) => ["payments", "order", orderId] as const,
  },
  stocks: {
    all: ["stocks"] as const,
    list: (filters: StockListFilters) => ["stocks", "list", filters] as const,
    detail: (stockId: number) => ["stocks", "detail", stockId] as const,
  },
  units: {
    all: ["units"] as const,
    list: () => ["units", "list"] as const,
  },
  menus: {
    all: ["menus"] as const,
    list: (filters: MenuListFilters) => ["menus", "list", filters] as const,
    detail: (menuId: number) => ["menus", "detail", menuId] as const,
  },
  staff: {
    all: ["staff"] as const,
    list: (filters: StaffListFilters) => ["staff", "list", filters] as const,
  },
  sellingReports: {
    all: ["selling-reports"] as const,
    list: (filters: SellingReportListFilters) => ["selling-reports", "list", filters] as const,
  },
  tables: {
    all: ["tables"] as const,
    list: () => ["tables", "list"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    cashierStats: () => ["dashboard", "cashier", "stats"] as const,
    cashierActiveOrders: () => ["dashboard", "cashier", "active-orders"] as const,
    cashierPendingPayments: () => ["dashboard", "cashier", "pending-payments"] as const,
    managerStats: () => ["dashboard", "manager", "stats"] as const,
    managerChart: (period: ChartPeriod) => ["dashboard", "manager", "chart", period] as const,
  },
  predictions: {
    all: ["predictions"] as const,
    forecast: (days: number) => ["predictions", "forecast", days] as const,
    accuracy: (metric: MetricKey) => ["predictions", "accuracy", metric] as const,
  },
}
