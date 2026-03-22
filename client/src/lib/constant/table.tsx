export type TableStatus = "aktif" | "nonaktif"

export type Table = {
  id: string
  tableNumber: number
  tableCode: string
  status: TableStatus
  qrValue: string
}

export const TABLE_STATUS_CONFIG: Record<TableStatus, {
  label: string
  badgeClass: string
}> = {
  aktif: {
    label: "Aktif",
    badgeClass: "bg-primary/10 text-primary",
  },
  nonaktif: {
    label: "Nonaktif",
    badgeClass: "bg-destructive/10 text-destructive",
  },
}

export const TABLES: Table[] = [
  { id: "1", tableNumber: 1, tableCode: "T-01", status: "aktif", qrValue: "https://vora.app/table/T-01" },
  { id: "2", tableNumber: 2, tableCode: "T-02", status: "aktif", qrValue: "https://vora.app/table/T-02" },
  { id: "3", tableNumber: 3, tableCode: "T-03", status: "nonaktif", qrValue: "https://vora.app/table/T-03" },
  { id: "4", tableNumber: 4, tableCode: "T-04", status: "aktif", qrValue: "https://vora.app/table/T-04" },
  { id: "5", tableNumber: 5, tableCode: "T-05", status: "aktif", qrValue: "https://vora.app/table/T-05" },
]