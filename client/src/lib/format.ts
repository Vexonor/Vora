const LOCALE = "id-ID"

type DateInput = string | number | Date | null | undefined

const DATE_PRESETS = {
  long: { day: "numeric", month: "long", year: "numeric" },
  short: { day: "numeric", month: "short", year: "numeric" },
  dayMonth: { day: "numeric", month: "short" },
  weekday: { weekday: "long", day: "numeric", month: "short", year: "numeric" },
  weekdayLong: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  dateTime: { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" },
} satisfies Record<string, Intl.DateTimeFormatOptions>

type DatePreset = keyof typeof DATE_PRESETS

export function formatNumber(value: number | string) {
  return Number(value).toLocaleString(LOCALE, { maximumFractionDigits: 0 })
}

export function formatRupiah(value: number | string) {
  return `Rp ${formatNumber(value)}`
}

export function formatRupiahInMillions(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
  return formatRupiah(value)
}

export function formatRupiahCompact(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`
  return formatRupiah(value)
}

export function formatThousands(value: string | number | null | undefined) {
  const digits = stripNonDigits(String(value ?? ""))
  return digits ? Number(digits).toLocaleString(LOCALE) : ""
}

export function stripNonDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function formatDate(value: DateInput, preset: DatePreset = "long", fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback
  return new Date(value).toLocaleString(LOCALE, DATE_PRESETS[preset])
}

export function formatTime(value: DateInput, { withTimeZone = true } = {}, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback
  return new Date(value).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    ...(withTimeZone && { timeZoneName: "short" }),
  })
}
