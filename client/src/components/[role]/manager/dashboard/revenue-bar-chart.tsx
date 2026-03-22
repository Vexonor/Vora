"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartData = [
  { day: "Min", revenue: 240000 },
  { day: "Sen", revenue: 400000 },
  { day: "Sel", revenue: 295000 },
  { day: "Rab", revenue: 165000 },
  { day: "Kam", revenue: 165000 },
  { day: "Jum", revenue: 340000 },
  { day: "Sab", revenue: 0 },
]

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--primary)" },
  capital: { label: "Modal", color: "var(--error)" },
}

const formatCurrency = (value: number) => `Rp. ${value.toLocaleString("id-ID")}`
const formatYAxis = (value: number) => (value === 0 ? "0" : `${value / 1000}k`)

export function RevenueBarChart() {
  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pendapatan</h4>

      <div className="flex gap-8">
        <div>
          <p className="font-bold text-2xl">{formatCurrency(1050000)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan per bulan</p>
        </div>
        <div>
          <p className="font-bold text-2xl">{formatCurrency(250000)}</p>
          <p className="text-sm text-muted-foreground">Total pendapatan hari ini</p>
        </div>
      </div>

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
            domain={[0, 400000]}
            ticks={[100000, 200000, 300000, 400000]}
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
    </div>
  )
}