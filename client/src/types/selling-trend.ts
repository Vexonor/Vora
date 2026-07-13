export type MetricKey =
  | "gross_revenue"
  | "net_profit"
  | "total_transaction"
  | "total_items_sold";

export interface AccuracyPoint {
  target_date: string;
  predicted: number;
  actual: number;
}

export interface AccuracySummary {
  mape: number | null;
  accuracy: number | null;
  mae: number | null;
  rmse: number | null;
  points: number;
}

export interface AccuracyResponse {
  metric: MetricKey;
  series: AccuracyPoint[];
  summary: AccuracySummary;
}
