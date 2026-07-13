export type MetricKey =
  | 'gross_revenue'
  | 'net_profit'
  | 'total_transaction'
  | 'total_items_sold';

export interface ForecastRow {
  generated_date: string;
  target_date: string;
  gross_revenue: number;
  net_profit: number;
  total_transaction: number;
  total_items_sold: number;
}

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

export const METRIC_KEYS: MetricKey[] = [
  'gross_revenue',
  'net_profit',
  'total_transaction',
  'total_items_sold',
];

/**
 * Untuk tiap target_date, pilih baris forecast dengan generated_date terbesar
 * yang masih SEBELUM target_date ("ramalan paling segar per H-1").
 */
export function pickFreshestForecasts(rows: ForecastRow[]): Map<string, ForecastRow> {
  const picked = new Map<string, ForecastRow>();
  for (const row of rows) {
    if (row.generated_date >= row.target_date) continue; // hanya ramalan sebelum hari-H
    const current = picked.get(row.target_date);
    if (!current || row.generated_date > current.generated_date) {
      picked.set(row.target_date, row);
    }
  }
  return picked;
}

export function computeAccuracySummary(series: AccuracyPoint[]): AccuracySummary {
  if (series.length === 0) {
    return { mape: null, accuracy: null, mae: null, rmse: null, points: 0 };
  }

  let absErrorSum = 0;
  let sqErrorSum = 0;
  let apeSum = 0;
  let apeCount = 0;

  for (const point of series) {
    const error = point.actual - point.predicted;
    absErrorSum += Math.abs(error);
    sqErrorSum += error * error;
    if (point.actual !== 0) {
      apeSum += Math.abs(error) / Math.abs(point.actual);
      apeCount += 1;
    }
  }

  const mae = absErrorSum / series.length;
  const rmse = Math.sqrt(sqErrorSum / series.length);
  const mape = apeCount > 0 ? (apeSum / apeCount) * 100 : null;
  const accuracy = mape === null ? null : Math.max(0, 100 - mape);

  return { mape, accuracy, mae, rmse, points: series.length };
}
