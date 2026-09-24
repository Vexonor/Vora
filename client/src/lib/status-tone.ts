export type StatusTone = "primary" | "secondary" | "warning" | "info" | "destructive" | "neutral"

export const TONE_OUTLINE_CLASS: Record<StatusTone, string> = {
  primary: "border border-primary text-primary",
  secondary: "border border-secondary text-secondary",
  warning: "border border-amber-500 text-amber-600",
  info: "border border-blue-500 text-blue-600",
  destructive: "border border-destructive text-destructive",
  neutral: "border border-foreground/30 text-foreground",
}

export const TONE_SOFT_CLASS: Record<StatusTone, string> = {
  primary: "border-primary/40 bg-primary/10 text-primary",
  secondary: "border-secondary/40 bg-secondary/10 text-secondary",
  warning: "border-amber-500/40 bg-amber-50 text-amber-600",
  info: "border-blue-500/40 bg-blue-50 text-blue-600",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  neutral: "border-foreground/30 bg-foreground/5 text-foreground/60",
}

export const TONE_SOLID_CLASS: Record<StatusTone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  destructive: "bg-destructive",
  neutral: "bg-foreground/40",
}
