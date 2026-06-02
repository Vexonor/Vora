"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2Icon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

const chartConfig = {
  completed: { label: "Pendapatan", color: "var(--primary)" },
  canceled: { label: "Dibatalkan", color: "var(--destructive)" },
}

const formatCurrency = (value: number) => `Rp ${Number(value).toLocaleString("id-ID")}`

type Props = {
  completed: number
  canceled: number
  periodLabel: string
  isLoading?: boolean
}

export function RevenueDonutChart({ completed, canceled, periodLabel, isLoading }: Props) {
  const hasData = completed > 0 || canceled > 0
  const chartData = hasData
    ? [
        { name: "completed", value: completed },
        { name: "canceled", value: canceled },
      ]
    : [{ name: "completed", value: 1 }]

  const COLORS = hasData
    ? ["var(--primary)", "var(--destructive)"]
    : ["hsl(var(--border))"]

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Ringkasan Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatCurrency(completed)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan {periodLabel}</p>
        </div>
        <div>
          <p className="font-bold text-2xl text-destructive">{isLoading ? "—" : formatCurrency(canceled)}</p>
          <p className="text-sm text-muted-foreground">Pesanan dibatalkan {periodLabel}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="mx-auto h-80 w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            {hasData && <ChartLegend content={<ChartLegendContent nameKey="name" />} />}
          </PieChart>
        </ChartContainer>
      )}
    </div>
  )
}
