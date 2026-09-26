import { queryKeys } from "@/lib/query-keys"
import { aiPredictionService } from "@/services/ai-prediction.service"
import { sellingTrendService } from "@/services/selling-trend.service"
import type { MetricKey } from "@/types/selling-trend"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

const PREDICTION_FORECAST_STALE_TIME_MS = 5 * 60_000

export function usePredictionForecast(days: number) {
  return useQuery({
    queryKey: queryKeys.predictions.forecast(days),
    queryFn: () => aiPredictionService.predict(days),
    placeholderData: keepPreviousData,
    staleTime: PREDICTION_FORECAST_STALE_TIME_MS,
  })
}

export function usePredictionAccuracy(metric: MetricKey) {
  return useQuery({
    queryKey: queryKeys.predictions.accuracy(metric),
    queryFn: () => sellingTrendService.getAccuracy({ metric }),
  })
}
