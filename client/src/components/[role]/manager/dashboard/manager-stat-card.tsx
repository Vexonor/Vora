type ManagerStat = {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendIcon?: React.ReactNode
  trendLabel: string
}

export function ManagerStatCard({ title, value, icon, trendIcon, trendLabel }: ManagerStat) {
  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center p-2.5 shrink-0">
          {icon}
        </div>
        <p className="font-bold text-lg">{title}</p>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        {trendIcon}
        <span className="text-sm text-muted-foreground">{trendLabel}</span>
      </div>

      {/* Value */}
      <p className="font-bold text-3xl">{value}</p>
    </div>
  )
}