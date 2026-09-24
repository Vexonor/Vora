export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  return typeof message === "string" && message.trim() !== "" ? message : fallbackMessage
}
