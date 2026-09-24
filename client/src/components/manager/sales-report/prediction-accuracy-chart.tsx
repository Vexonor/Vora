"use client"

import { formatDate, formatNumber } from "@/lib/format"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { sellingTrendService } from "@/services/selling-trend.service"
import type { AccuracyResponse, MetricKey } from "@/types/selling-trend"
import { GaugeIcon, InfoIcon, Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const METRIC_OPTIONS: { key: MetricKey; label: string }[] = [
  { key: "gross_revenue", label: "Pendapatan Kotor" },
  { key: "net_profit", label: "Laba Bersih" },
  { key: "total_transaction", label: "Jumlah Transaksi" },
  { key: "total_items_sold", label: "Item Terjual" },
]

export function PredictionAccuracyChart() {
  const [metric, setMetric] = useState<MetricKey>("gross_revenue")
  const [data, setData] = useState<AccuracyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startRequest = useLatestRequest()

  const fetchAccuracy = useCallback(async (selectedMetric: MetricKey) => {
    const isLatest = startRequest()
    setIsLoading(true)
    setError(null)
    try {
      const result = await sellingTrendService.getAccuracy({ metric: selectedMetric })
      if (isLatest()) setData(result)
    } catch {
      if (isLatest()) setError("Gagal memuat data akurasi.")
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => { fetchAccuracy(metric) }, [fetchAccuracy, metric])

  const chartData = (data?.series ?? []).map((point) => ({
    label: formatDate(point.target_date, "dayMonth"),
    predicted: point.predicted,
    actual: point.actual,
  }))

  const summary = data?.summary
  const accuracyLabel = summary?.accuracy != null ? `${summary.accuracy.toFixed(1)}%` : "—"

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GaugeIcon className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Akurasi Prediksi</h3>
            <p className="text-xs text-muted-foreground">Prediksi vs realisasi (snapshot harian)</p>
          </div>
        </div>

        <div className="flex bg-muted/40 rounded-lg p-0.5 text-xs font-medium flex-wrap">
          {METRIC_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setMetric(option.key)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                metric === option.key ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {data && !isLoading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Akurasi", value: accuracyLabel, color: "text-primary" },
            { label: "MAPE", value: summary?.mape != null ? `${summary.mape.toFixed(1)}%` : "—", color: "text-foreground" },
            { label: "MAE", value: summary?.mae != null ? formatNumber(summary.mae) : "—", color: "text-foreground" },
            { label: "RMSE", value: summary?.rmse != null ? formatNumber(summary.rmse) : "—", color: "text-foreground" },
          ].map((card) => (
            <div key={card.label} className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className={`font-bold text-base ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="text-sm">Memuat data akurasi...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <button onClick={() => fetchAccuracy(metric)} className="text-xs text-primary underline mt-1">
              Coba lagi
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <InfoIcon className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Data akurasi belum tersedia</p>
            <p className="text-xs text-muted-foreground">Snapshot prediksi terkumpul otomatis setiap hari</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => formatNumber(value)} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={70} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" name="Aktual" stroke="#F49250" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="predicted" name="Prediksi" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
