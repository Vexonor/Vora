type Props = {
  title: string
  value: number | string
  icon: React.ReactNode
  isHighlighted?: boolean
  iconBackgroundClass: string
  iconColorClass: string
}

export function CashierStatCard({ title, value, icon, isHighlighted = false, iconBackgroundClass, iconColorClass }: Props) {
  const textColorClass = isHighlighted ? "text-white" : "text-foreground"

  return (
    <div className={`flex flex-col aspect-3/1 sm:aspect-4/1 md:aspect-video rounded-xl p-4
      ${isHighlighted ? "bg-primary" : "bg-white border border-foreground/40"}`}
    >
      <div className="flex justify-between">
        <span className={`text-base 2xl:text-xl font-semibold ${textColorClass}`}>
          {title}
        </span>
        <div className={`size-10 2xl:size-16 rounded-lg flex justify-center items-center p-2 2xl:p-4 ${iconBackgroundClass}`}>
          <span className={`size-full ${iconColorClass}`}>{icon}</span>
        </div>
      </div>
      <span className={`grow flex items-end text-3xl 2xl:text-5xl font-semibold ${textColorClass}`}>
        {value}
      </span>
    </div>
  )
}
