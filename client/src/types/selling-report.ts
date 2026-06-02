/**
 * SellingReport type matching the server SellingReport entity.
 */
export interface SellingReport {
  id: number;
  title: string;
  date: string;
  total_transaction: number;
  total_items_sold: number;
  unit_cost: number;
  gross_revenue: number;
  net_profit: number;
  created_at?: string;
  updated_at?: string;
}
