export type SalesReport = {
  id: string
  title: string
  date: string
  totalTransactions: number
  totalProducts: number
  capital: number
  grossRevenue: number
  netRevenue: number
}

export const SALES_REPORTS: SalesReport[] = [
  {
    id: "1",
    title: "Laporan Oktober 2025",
    date: "2025-10-21",
    totalTransactions: 248,
    totalProducts: 1204,
    capital: 2100000,
    grossRevenue: 6300000,
    netRevenue: 4200000,
  },
  {
    id: "2",
    title: "Laporan September 2025",
    date: "2025-09-30",
    totalTransactions: 312,
    totalProducts: 1540,
    capital: 2600000,
    grossRevenue: 7700000,
    netRevenue: 5100000,
  },
  {
    id: "3",
    title: "Laporan Agustus 2025",
    date: "2025-08-31",
    totalTransactions: 198,
    totalProducts: 980,
    capital: 1800000,
    grossRevenue: 5550000,
    netRevenue: 3750000,
  },
  {
    id: "4",
    title: "Laporan Juli 2025",
    date: "2025-07-31",
    totalTransactions: 275,
    totalProducts: 1320,
    capital: 2300000,
    grossRevenue: 6800000,
    netRevenue: 4500000,
  },
  {
    id: "5",
    title: "Laporan Juni 2025",
    date: "2025-06-30",
    totalTransactions: 220,
    totalProducts: 1100,
    capital: 1950000,
    grossRevenue: 5900000,
    netRevenue: 3950000,
  },
]