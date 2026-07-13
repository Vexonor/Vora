"use client"

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

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "gross_revenue", label: "Pendapatan Kotor" },
  { key: "net_profit", label: "Laba Bersih" },
  { key: "total_transaction", label: "Jumlah Transaksi" },
  { key: "total_items_sold", label: "Item Terjual" },
]

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" })

const formatNumber = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })

export function PredictionAccuracyChart() {
  const [metric, setMetric] = useState<MetricKey>("gross_revenue")
  const [data, setData] = useState<AccuracyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (m: MetricKey) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await sellingTrendService.getAccuracy({ metric: m })
      setData(result)
    } catch {
      setError("Gagal memuat data akurasi.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(metric) }, [load, metric])

  const chartData = (data?.series ?? []).map((p) => ({
    label: formatDate(p.target_date),
    predicted: p.predicted,
    actual: p.actual,
  }))

  const summary = data?.summary
  const accuracyLabel = summary?.accuracy != null ? `${summary.accuracy.toFixed(1)}%` : "—"

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-5">
      {/* Header */}
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
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                metric === m.key ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {data && !isLoading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Akurasi", value: accuracyLabel, color: "text-primary" },
            { label: "MAPE", value: summary?.mape != null ? `${summary.mape.toFixed(1)}%` : "—", color: "text-foreground" },
            { label: "MAE", value: summary?.mae != null ? formatNumber(summary.mae) : "—", color: "text-foreground" },
            { label: "RMSE", value: summary?.rmse != null ? formatNumber(summary.rmse) : "—", color: "text-foreground" },
          ].map((c) => (
            <div key={c.label} className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={`font-bold text-base ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="text-sm">Memuat data akurasi...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <button onClick={() => load(metric)} className="text-xs text-primary underline mt-1">
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
              <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={70} />
              <Tooltip formatter={(v: number) => formatNumber(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" name="Aktual" stroke="#056A68" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="predicted" name="Prediksi" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
