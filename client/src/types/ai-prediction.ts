export interface PredictionItem {
  date: string
  gross_revenue: number
  net_profit: number
  total_transaction: number
  total_items_sold: number
}

export interface HistoryItem {
  date: string
  gross_revenue: number
  net_profit: number
  total_transaction: number
  total_items_sold: number
}

export interface MetricItem {
  rmse: number
  mae: number
  r2: number
}

export interface ModelEvaluation {
  train_size: number
  test_size: number
  gross_revenue?: MetricItem
  net_profit?: MetricItem
  total_transaction?: MetricItem
  total_items_sold?: MetricItem
}

export interface PredictionResult {
  history: HistoryItem[]
  predictions: PredictionItem[]
  trained_on: number
  evaluation: ModelEvaluation
}
