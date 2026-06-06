"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2Icon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  count: { label: "Pesanan", color: "var(--primary)" },
}

const formatCount = (value: number) => (value === 0 ? "0" : String(value))

type Props = {
  data: Array<{ label: string; count: number }>
  totalInPeriod: number
  todayCount: number
  periodLabel: string
  isLoading?: boolean
}

export function OrderBarChart({ data, totalInPeriod, todayCount, periodLabel, isLoading }: Props) {
  const chartData = data.map((d) => ({ day: d.label, count: d.count }))
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const yMax = Math.ceil(maxCount * 1.3) || 10

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pesanan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : totalInPeriod}</p>
          <p className="text-sm text-muted-foreground">Total pesanan {periodLabel}</p>
        </div>
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : todayCount}</p>
          <p className="text-sm text-muted-foreground">Total pesanan hari ini</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart data={chartData} barCategoryGap="35%">
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
              tickFormatter={formatCount}
              domain={[0, yMax]}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}
