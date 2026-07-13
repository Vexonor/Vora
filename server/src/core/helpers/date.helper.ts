/**
 * Format Date menjadi "YYYY-MM-DD" memakai komponen waktu LOKAL.
 * Hindari toISOString() yang mengonversi ke UTC sehingga tanggal bisa
 * mundur 1 hari pada zona waktu non-UTC (mis. WIB +7).
 */
export function toLocalDateString(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
