import { UserRole } from "@/types/user"

export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  [UserRole.CASHIER]: "/cashier",
  [UserRole.KITCHEN]: "/kitchen",
  [UserRole.MANAGER]: "/manager",
}

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  [UserRole.CASHIER]: "/cashier/dashboard",
  [UserRole.KITCHEN]: "/kitchen/order",
  [UserRole.MANAGER]: "/manager/dashboard",
}

export function isPathAllowedForRole(path: string, role: UserRole) {
  const prefix = ROLE_ROUTE_PREFIX[role]
  if (!prefix || path.startsWith("//")) return false
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function getPostLoginPath(role: UserRole, requestedPath: string | null) {
  if (requestedPath && isPathAllowedForRole(requestedPath, role)) return requestedPath
  return ROLE_HOME_PATH[role] ?? "/"
}
