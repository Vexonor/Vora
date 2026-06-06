"use client"

import { aiPredictionService } from "@/services/ai-prediction.service"
import type { HistoryItem, ModelEvaluation, PredictionItem } from "@/types/ai-prediction"
import { BotIcon, InfoIcon, Loader2Icon, RefreshCwIcon, TrendingUpIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Range = 7 | 14 | 30

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`
  return `Rp ${v.toLocaleString("id-ID")}`
}

const formatDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

const r2Color = (r2: number) => {
  if (r2 >= 0.8) return "text-emerald-600"
  if (r2 >= 0.6) return "text-amber-500"
  return "text-red-500"
}

interface ChartPoint {
  date: string
  label: string
  hist_revenue?: number
  hist_profit?: number
  pred_revenue?: number
  pred_profit?: number
  isPrediction: boolean
}

function buildChartData(
  history: HistoryItem[],
  predictions: PredictionItem[],
  range: Range,
): ChartPoint[] {
  const histPoints: ChartPoint[] = history.slice(-14).map((h) => ({
    date: h.date,
    label: formatDate(h.date),
    hist_revenue: h.gross_revenue,
    hist_profit: h.net_profit,
    isPrediction: false,
  }))

  const predPoints: ChartPoint[] = predictions.slice(0, range).map((p) => ({
    date: p.date,
    label: formatDate(p.date),
    pred_revenue: p.gross_revenue,
    pred_profit: p.net_profit,
    isPrediction: true,
  }))

  // bridge: duplicate last history point as first pred point so lines connect
  if (histPoints.length > 0 && predPoints.length > 0) {
    const last = histPoints[histPoints.length - 1]
    predPoints[0] = {
      ...predPoints[0],
      hist_revenue: last.hist_revenue,
      hist_profit: last.hist_profit,
    }
  }

  return [...histPoints, ...predPoints]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-foreground/10 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-6">
          <span>{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

function EvaluationSection({ evaluation }: { evaluation: ModelEvaluation }) {
  const metrics = [
    { key: "gross_revenue", label: "Pendapatan Kotor" },
    { key: "net_profit", label: "Laba Bersih" },
    { key: "total_transaction", label: "Jumlah Transaksi" },
    { key: "total_items_sold", label: "Item Terjual" },
  ] as const

  const hasMetrics = metrics.some((m) => evaluation[m.key] != null)

  return (
    <div className="border border-foreground/10 rounded-xl p-4 bg-muted/20">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-foreground">Evaluasi Model (Test Set)</p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>Data latih: <b className="text-foreground">{evaluation.train_size}</b></span>
          <span>Data uji: <b className="text-foreground">{evaluation.test_size}</b></span>
        </div>
      </div>

      {!hasMetrics ? (
        <p className="text-xs text-muted-foreground">
          Data terlalu sedikit untuk menghasilkan metrik evaluasi (perlu &gt;2 data).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {metrics.map(({ key, label }) => {
              const m = evaluation[key]
              if (!m) return null
              return (
                <div key={key} className="bg-white rounded-lg p-2.5 border border-foreground/5">
                  <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">{label}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">RMSE</span>
                      <span className="font-medium">{m.rmse.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">MAE</span>
                      <span className="font-medium">{m.mae.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">R²</span>
                      <span className={`font-bold ${r2Color(m.r2)}`}>{m.r2.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            R² mendekati 1.0 = akurasi tinggi · RMSE &amp; MAE = rata-rata deviasi prediksi
          </p>
        </>
      )}
    </div>
  )
}

export function PredictionChart() {
  const [data, setData] = useState<{
    history: HistoryItem[]
    predictions: PredictionItem[]
    evaluation: ModelEvaluation
  } | null>(null)
  const [range, setRange] = useState<Range>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (days: Range) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await aiPredictionService.predict(days)
      setData({
        history: result.history,
        predictions: result.predictions,
        evaluation: result.evaluation,
      })
    } catch (err: any) {
      setError(err?.message ?? "Gagal memuat prediksi")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(range) }, [load, range])

  const chartData = data ? buildChartData(data.history, data.predictions, range) : []
  const todayLabel = data?.history?.length
    ? formatDate(data.history[data.history.length - 1].date)
    : undefined

  const totalPredRevenue = data?.predictions.slice(0, range).reduce((s, p) => s + p.gross_revenue, 0) ?? 0
  const totalPredProfit = data?.predictions.slice(0, range).reduce((s, p) => s + p.net_profit, 0) ?? 0
  const totalPredTx = data?.predictions.slice(0, range).reduce((s, p) => s + p.total_transaction, 0) ?? 0

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BotIcon className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Prediksi Tren Penjualan</h3>
            <p className="text-xs text-muted-foreground">Random Forest Regression · Split 80/20 · Data historis + proyeksi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted/40 rounded-lg p-0.5 text-xs font-medium">
            {([7, 14, 30] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  range === r ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r} hari
              </button>
            ))}
          </div>

          <button
            onClick={() => load(range)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-foreground/10 hover:bg-muted/40 transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`size-3.5 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {data && !isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: `Prediksi Pendapatan (${range}h)`, value: formatCurrency(totalPredRevenue), color: "text-primary" },
            { label: `Prediksi Laba Bersih (${range}h)`, value: formatCurrency(totalPredProfit), color: "text-emerald-600" },
            { label: `Prediksi Transaksi (${range}h)`, value: Math.round(totalPredTx).toLocaleString("id-ID"), color: "text-foreground" },
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
            <span className="text-sm">Melatih model prediksi...</span>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <TrendingUpIcon className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <p className="text-xs text-muted-foreground">Pastikan AI service (Python) sudah berjalan di port 8090</p>
            <button
              onClick={() => load(range)}
              className="text-xs text-primary underline mt-1"
            >
              Coba lagi
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <InfoIcon className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Belum ada data historis yang cukup</p>
            <p className="text-xs text-muted-foreground">Minimal 2 laporan penjualan diperlukan</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {todayLabel && (
                <ReferenceLine
                  x={todayLabel}
                  stroke="#9ca3af"
                  strokeDasharray="4 2"
                  label={{ value: "Hari ini", position: "top", fontSize: 10, fill: "#9ca3af" }}
                />
              )}
              <Line type="monotone" dataKey="hist_revenue" name="Pendapatan (aktual)"
                stroke="#056A68" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="hist_profit" name="Laba bersih (aktual)"
                stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="pred_revenue" name="Pendapatan (prediksi)"
                stroke="#056A68" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
              <Line type="monotone" dataKey="pred_profit" name="Laba bersih (prediksi)"
                stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Evaluation metrics */}
      {data && !isLoading && !error && (
        <EvaluationSection evaluation={data.evaluation} />
      )}

      {/* Footer note */}
      {!isLoading && !error && data && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <InfoIcon className="size-3 shrink-0" />
          Dilatih dari {data.history.length} data historis · Garis putus-putus = proyeksi
        </p>
      )}
    </div>
  )
}
