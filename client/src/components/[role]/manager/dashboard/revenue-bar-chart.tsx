"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatRupiah } from "@/lib/format"
import { Loader2Icon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const CHART_CONFIG = {
  revenue: { label: "Pendapatan", color: "var(--primary)" },
}


const formatRevenueTick = (value: number) => {
  if (value === 0) return "0"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return `${value / 1000}k`
}

type Props = {
  data: Array<{ label: string; revenue: number }>
  totalInPeriod: number
  todayRevenue: number
  periodDescription: string
  isLoading?: boolean
}

export function RevenueBarChart({ data, totalInPeriod, todayRevenue, periodDescription, isLoading }: Props) {
  const chartData = data.map((point) => ({ day: point.label, revenue: point.revenue }))
  const highestRevenue = Math.max(...data.map((point) => point.revenue), 1)
  const yAxisMax = Math.ceil(highestRevenue * 1.3)

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatRupiah(totalInPeriod)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan {periodDescription}</p>
        </div>
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatRupiah(todayRevenue)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan hari ini</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={CHART_CONFIG} className="h-80 w-full">
          <BarChart data={chartData} barCategoryGap="40%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={formatRevenueTick}
              domain={[0, yAxisMax]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRupiah(value as number)}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}
