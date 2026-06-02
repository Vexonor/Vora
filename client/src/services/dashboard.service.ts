import type { CashierDashboardStats, ChartPeriod, ManagerChartData, ManagerDashboardStats } from "@/types/dashboard";
import type { Order } from "@/types/order";
import apiClient from "./api-client";

export const dashboardService = {
  getManagerStats: async (): Promise<ManagerDashboardStats> => {
    return apiClient.get("/dashboard/manager");
  },

  getCashierStats: async (): Promise<CashierDashboardStats> => {
    return apiClient.get("/dashboard/cashier");
  },

  getManagerChartData: async (period: ChartPeriod): Promise<ManagerChartData> => {
    return apiClient.get("/dashboard/manager/chart", { params: { period } });
  },

  getActiveOrders: async (): Promise<Order[]> => {
    return apiClient.get("/dashboard/cashier/active-orders");
  },

  getPendingPayments: async (): Promise<Order[]> => {
    return apiClient.get("/dashboard/cashier/pending-payments");
  },
};
