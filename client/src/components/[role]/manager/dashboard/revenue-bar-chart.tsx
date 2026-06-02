"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2Icon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--primary)" },
}

const formatCurrency = (value: number) =>
  `Rp ${Number(value).toLocaleString("id-ID")}`

const formatYAxis = (value: number) => {
  if (value === 0) return "0"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return `${value / 1000}k`
}

type Props = {
  data: Array<{ label: string; revenue: number }>
  totalInPeriod: number
  todayRevenue: number
  periodLabel: string
  isLoading?: boolean
}

export function RevenueBarChart({ data, totalInPeriod, todayRevenue, periodLabel, isLoading }: Props) {
  const chartData = data.map((d) => ({ day: d.label, revenue: d.revenue }))
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const yMax = Math.ceil(maxRevenue * 1.3)

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatCurrency(totalInPeriod)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan {periodLabel}</p>
        </div>
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatCurrency(todayRevenue)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan hari ini</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart data={chartData} barCategoryGap="40%">
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
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
              tickFormatter={formatYAxis}
              domain={[0, yMax]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
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
