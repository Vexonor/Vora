"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartData = [
  { day: "Min", yesterday: 350, today: 800 },
  { day: "Sen", yesterday: 800, today: 580 },
  { day: "Sel", yesterday: 700, today: 670 },
  { day: "Rab", yesterday: 800, today: 370 },
  { day: "Kam", yesterday: 450, today: 360 },
  { day: "Jum", yesterday: 450, today: 370 },
  { day: "Sab", yesterday: 450, today: 800 },
]

const chartConfig = {
  yesterday: { label: "Semalam", color: "var(--secondary)" },
  today: { label: "Hari Ini", color: "var(--primary)" },
}

export function OrderBarChart() {
  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pesanan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">600</p>
          <p className="text-sm text-muted-foreground">Total pesanan per bulan</p>
        </div>
        <div>
          <p className="font-bold text-2xl">122</p>
          <p className="text-sm text-muted-foreground">Total pesanan hari ini</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
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
            domain={[0, 1000]}
            ticks={[200, 400, 600, 800]}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="yesterday" fill="var(--color-yesterday)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="today" fill="var(--color-today)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}