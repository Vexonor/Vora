"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatRupiah } from "@/lib/format"
import { Loader2Icon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

const CHART_CONFIG = {
  completed: { label: "Pendapatan", color: "var(--primary)" },
  canceled: { label: "Dibatalkan", color: "var(--destructive)" },
}


type Props = {
  completedRevenue: number
  canceledRevenue: number
  periodDescription: string
  isLoading?: boolean
}

export function RevenueDonutChart({ completedRevenue, canceledRevenue, periodDescription, isLoading }: Props) {
  const hasData = completedRevenue > 0 || canceledRevenue > 0
  const chartData = hasData
    ? [
        { name: "completed", value: completedRevenue },
        { name: "canceled", value: canceledRevenue },
      ]
    : [{ name: "completed", value: 1 }]

  const sliceColors = hasData
    ? ["var(--primary)", "var(--destructive)"]
    : ["var(--border)"]

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Ringkasan Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{isLoading ? "—" : formatRupiah(completedRevenue)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan {periodDescription}</p>
        </div>
        <div>
          <p className="font-bold text-2xl text-destructive">{isLoading ? "—" : formatRupiah(canceledRevenue)}</p>
          <p className="text-sm text-muted-foreground">Pesanan dibatalkan {periodDescription}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={CHART_CONFIG} className="mx-auto h-80 w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRupiah(value as number)}
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
                <Cell key={entry.name} fill={sliceColors[index]} />
              ))}
            </Pie>
            {hasData && <ChartLegend content={<ChartLegendContent nameKey="name" />} />}
          </PieChart>
        </ChartContainer>
      )}
    </div>
  )
}
