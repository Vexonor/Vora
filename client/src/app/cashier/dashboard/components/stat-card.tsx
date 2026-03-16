import { StatCardProps } from "@/lib/type/stat-card";


function StatCard({ title, value, icon, variant = "default", iconBg, iconColor }: StatCardProps) {
  const isPrimary = variant === "primary"

  return (
    <div className={`flex flex-col aspect-3/1 sm:aspect-4/1 md:aspect-video rounded-xl p-4
      ${isPrimary
        ? "bg-primary"
        : "bg-white border border-foreground/40"
      }`}
    >
      <div className="flex justify-between">
        <span className={`text-base 2xl:text-xl font-semibold ${isPrimary ? "text-white" : "text-foreground"}`}>
          {title}
        </span>
        <div className={`size-10 2xl:size-16 rounded-lg flex justify-center items-center p-2 2xl:p-4 ${iconBg}`}>
          <span className={`size-full ${iconColor}`}>{icon}</span>
        </div>
      </div>
      <span className={`grow flex items-end text-3xl 2xl:text-5xl font-semibold ${isPrimary ? "text-white" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}

export default StatCard;