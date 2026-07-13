"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { formatThousands, digitsOnly } from "@/lib/currency"

type ReportForm = {
  title: string
  date: string
  totalTransactions: string
  totalProducts: string
  capital: string
  operational: string
  grossRevenue: string
}

type ReportFormErrors = Partial<Record<keyof ReportForm, string>>

type Props = {
  onSubmit: (form: ReportForm) => Promise<void>
  onClose: () => void
}

export function AddReportModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ReportForm>({
    title: "", date: "", totalTransactions: "",
    totalProducts: "", capital: "", operational: "", grossRevenue: "",
  })
  const [errors, setErrors] = useState<ReportFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): ReportFormErrors => {
    const e: ReportFormErrors = {}
    if (!form.title.trim()) e.title = "Judul tidak boleh kosong."
    if (!form.date) e.date = "Tanggal tidak boleh kosong."
    if (!form.totalTransactions || isNaN(Number(form.totalTransactions))) e.totalTransactions = "Tidak valid."
    if (!form.totalProducts || isNaN(Number(form.totalProducts))) e.totalProducts = "Tidak valid."
    if (!form.capital || isNaN(Number(form.capital))) e.capital = "Tidak valid."
    if (!form.grossRevenue || isNaN(Number(form.grossRevenue))) e.grossRevenue = "Tidak valid."
    if (!form.operational || isNaN(Number(form.operational))) e.operational = "Tidak valid."
    return e
  }

  const handleChange = (key: keyof ReportForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // Field uang: simpan angka mentah, tampilkan dengan pemisah ribuan.
  const handleMoneyChange = (key: keyof ReportForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: digitsOnly(e.target.value) }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      await onSubmit(form)
      toast.success("Laporan berhasil dibuat.")
      onClose()
    } catch {
      toast.error("Gagal membuat laporan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah laporan penjualan</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">

          <FormField label="Judul laporan penjualan" error={errors.title}>
            <Input
              autoFocus
              placeholder="Masukkan judul laporan penjualan"
              value={form.title}
              onChange={handleChange("title")}
              aria-invalid={!!errors.title}
            />
          </FormField>

          <FormField label="Tanggal laporan penjualan" error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              aria-invalid={!!errors.date}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total transaksi" error={errors.totalTransactions}>
              <Input
                type="number"
                placeholder="Masukkan total transaksi"
                value={form.totalTransactions}
                onChange={handleChange("totalTransactions")}
                aria-invalid={!!errors.totalTransactions}
              />
            </FormField>
            <FormField label="Total produk yang terjual" error={errors.totalProducts}>
              <Input
                type="number"
                placeholder="Masukkan total produk"
                value={form.totalProducts}
                onChange={handleChange("totalProducts")}
                aria-invalid={!!errors.totalProducts}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="HPP (modal bahan)" error={errors.capital}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Masukkan jumlah modal"
                value={formatThousands(form.capital)}
                onChange={handleMoneyChange("capital")}
                aria-invalid={!!errors.capital}
              />
            </FormField>
            <FormField label="Pendapatan kotor" error={errors.grossRevenue}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Masukkan jumlah pendapatan kotor"
                value={formatThousands(form.grossRevenue)}
                onChange={handleMoneyChange("grossRevenue")}
                aria-invalid={!!errors.grossRevenue}
              />
            </FormField>
          </div>

          <FormField label="Modal operasional" error={errors.operational}>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Belanja harian, gas, kemasan, dll."
              value={formatThousands(form.operational)}
              onChange={handleMoneyChange("operational")}
              aria-invalid={!!errors.operational}
            />
          </FormField>

          <div className="rounded-lg bg-muted/30 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pendapatan bersih (otomatis)</span>
            <span className="text-sm font-semibold">
              Rp {(
                Number(form.grossRevenue || 0) -
                Number(form.capital || 0) -
                Number(form.operational || 0)
              ).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
