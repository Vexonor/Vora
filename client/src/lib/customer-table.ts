const CUSTOMER_TABLE_STORAGE_KEY = "table_id"
const DEFAULT_TABLE_ID = 1

export function saveCustomerTableId(tableId: string) {
  localStorage.setItem(CUSTOMER_TABLE_STORAGE_KEY, tableId)
}

export function readCustomerTableId() {
  const storedTableId = Number(localStorage.getItem(CUSTOMER_TABLE_STORAGE_KEY))
  return Number.isInteger(storedTableId) && storedTableId > 0 ? storedTableId : DEFAULT_TABLE_ID
}
