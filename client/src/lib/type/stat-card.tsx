export interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  variant?: "primary" | "default"
  iconBg?: string
  iconColor?: string
}