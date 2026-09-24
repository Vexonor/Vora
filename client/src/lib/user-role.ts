import type { StatusTone } from "@/lib/status-tone"
import { UserRole } from "@/types/user"

const USER_ROLE_DISPLAY: Record<UserRole, { label: string; tone: StatusTone }> = {
  [UserRole.CASHIER]: { label: "Kasir", tone: "secondary" },
  [UserRole.KITCHEN]: { label: "Kitchen", tone: "warning" },
  [UserRole.MANAGER]: { label: "Manager", tone: "primary" },
}

export function getUserRoleDisplay(role: number, fallbackLabel = "Unknown") {
  return USER_ROLE_DISPLAY[role as UserRole] ?? { label: fallbackLabel, tone: "neutral" as const }
}

export const USER_ROLE_OPTIONS = [UserRole.CASHIER, UserRole.KITCHEN, UserRole.MANAGER].map((role) => ({
  value: role,
  ...USER_ROLE_DISPLAY[role],
}))
