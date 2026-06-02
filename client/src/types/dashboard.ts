export interface ManagerDashboardStats {
  menuCount: number;
  orderCount: number;
  tableCount: number;
}

export interface CashierDashboardStats {
  newOrders: number;
  processingOrders: number;
  totalOrders: number;
}

export type ChartPeriod = '7d' | '30d' | '6m';

export interface ManagerChartData {
  orders: {
    chart: Array<{ label: string; count: number }>;
    totalInPeriod: number;
    todayCount: number;
  };
  revenue: {
    chart: Array<{ label: string; revenue: number }>;
    totalInPeriod: number;
    todayRevenue: number;
    completed: number;
    canceled: number;
  };
}
