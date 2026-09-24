import type { User } from "@/types/user"

export const AUTH_COOKIE_NAME = {
  accessToken: "access_token",
  userRole: "user_role",
} as const

const STORAGE_KEY = {
  accessToken: "access_token",
  user: "user",
} as const

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`
}

export function readAccessToken() {
  return localStorage.getItem(STORAGE_KEY.accessToken)
}

export function readStoredSession(): { accessToken: string; user: User } | null {
  const accessToken = localStorage.getItem(STORAGE_KEY.accessToken)
  const storedUser = localStorage.getItem(STORAGE_KEY.user)
  if (!accessToken || !storedUser) return null
  return { accessToken, user: JSON.parse(storedUser) as User }
}

export function saveSession(accessToken: string, user: User) {
  localStorage.setItem(STORAGE_KEY.accessToken, accessToken)
  saveStoredUser(user)
  setCookie(AUTH_COOKIE_NAME.accessToken, accessToken, SESSION_MAX_AGE_SECONDS)
  setCookie(AUTH_COOKIE_NAME.userRole, String(user.role), SESSION_MAX_AGE_SECONDS)
}

export function saveStoredUser(user: User) {
  localStorage.setItem(STORAGE_KEY.user, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY.accessToken)
  localStorage.removeItem(STORAGE_KEY.user)
  setCookie(AUTH_COOKIE_NAME.accessToken, "", 0)
  setCookie(AUTH_COOKIE_NAME.userRole, "", 0)
}
