"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"

const COLORS = [
  "var(--primary)",
  "var(--error)",
]

const chartData = [
  { name: "revenue", value: 950000 },
  { name: "capital", value: 250000 },
]

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--success)" },
  capital: { label: "Modal", color: "var(--error)" },
}

const formatCurrency = (value: number) => `Rp. ${value.toLocaleString("id-ID")}`

export function RevenueDonutChart() {
  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{formatCurrency(950000)}</p>
          <p className="text-sm text-muted-foreground">Total modal hari ini</p>
        </div>
        <div>
          <p className="font-bold text-2xl">{formatCurrency(250000)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan hari ini</p>
        </div>
      </div>

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
              <Cell
                key={entry.name}
                fill={COLORS[index]}
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    </div>
  )
}