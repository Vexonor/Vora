"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type ReportForm = {
  title: string
  date: string
  totalTransactions: string
  totalProducts: string
  capital: string
  grossRevenue: string
  netRevenue: string
}

type ReportFormErrors = Partial<Record<keyof ReportForm, string>>

type Props = {
  onSubmit: (form: ReportForm) => Promise<void>
  onClose: () => void
}

export function AddReportModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ReportForm>({
    title: "", date: "", totalTransactions: "",
    totalProducts: "", capital: "", grossRevenue: "", netRevenue: "",
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
    if (!form.netRevenue || isNaN(Number(form.netRevenue))) e.netRevenue = "Tidak valid."
    return e
  }

  const handleChange = (key: keyof ReportForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
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

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Judul laporan penjualan</Label>
            <Input
              autoFocus
              placeholder="Masukkan judul laporan penjualan"
              value={form.title}
              onChange={handleChange("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Tanggal laporan penjualan</Label>
            <Input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              aria-invalid={!!errors.date}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium">Total transaksi</Label>
              <Input
                type="number"
                placeholder="Masukkan total transaksi"
                value={form.totalTransactions}
                onChange={handleChange("totalTransactions")}
                aria-invalid={!!errors.totalTransactions}
              />
              {errors.totalTransactions && <p className="text-xs text-destructive">{errors.totalTransactions}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium">Total produk yang terjual</Label>
              <Input
                type="number"
                placeholder="Masukkan total produk"
                value={form.totalProducts}
                onChange={handleChange("totalProducts")}
                aria-invalid={!!errors.totalProducts}
              />
              {errors.totalProducts && <p className="text-xs text-destructive">{errors.totalProducts}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium">Modal</Label>
              <Input
                type="number"
                placeholder="Masukkan jumlah modal"
                value={form.capital}
                onChange={handleChange("capital")}
                aria-invalid={!!errors.capital}
              />
              {errors.capital && <p className="text-xs text-destructive">{errors.capital}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-medium">Pendapatan kotor</Label>
              <Input
                type="number"
                placeholder="Masukkan jumlah pendapatan kotor"
                value={form.grossRevenue}
                onChange={handleChange("grossRevenue")}
                aria-invalid={!!errors.grossRevenue}
              />
              {errors.grossRevenue && <p className="text-xs text-destructive">{errors.grossRevenue}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Pendapatan bersih</Label>
            <Input
              type="number"
              placeholder="Masukkan jumlah pendapatan bersih"
              value={form.netRevenue}
              onChange={handleChange("netRevenue")}
              aria-invalid={!!errors.netRevenue}
            />
            {errors.netRevenue && <p className="text-xs text-destructive">{errors.netRevenue}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
