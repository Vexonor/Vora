export const TAX_RATE = 0.1

export function addTaxToSubtotal(subtotal: number) {
  const tax = subtotal * TAX_RATE
  return { subtotal, tax, total: subtotal + tax }
}

export function splitTaxFromTotal(total: number) {
  const subtotal = total / (1 + TAX_RATE)
  return { subtotal, tax: total - subtotal, total }
}
