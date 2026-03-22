"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SaveIcon } from "lucide-react"
import { useState } from "react"

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
  onSubmit: (form: ReportForm) => string | null
  onClose: () => void
}

export function AddReportModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ReportForm>({
    title: "", date: "", totalTransactions: "",
    totalProducts: "", capital: "", grossRevenue: "", netRevenue: "",
  })
  const [errors, setErrors] = useState<ReportFormErrors>({})

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

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const errorMsg = onSubmit(form)
    if (errorMsg) {
      setErrors({ title: errorMsg })
      return
    }
    onClose()
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
              className={`border ${errors.title ? "border-destructive" : "border-primary"}`}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Tanggal laporan penjualan</Label>
            <Input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              className={`border ${errors.date ? "border-destructive" : "border-primary"}`}
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
                className={`border ${errors.totalTransactions ? "border-destructive" : "border-primary"}`}
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
                className={`border ${errors.totalProducts ? "border-destructive" : "border-primary"}`}
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
                className={`border ${errors.capital ? "border-destructive" : "border-primary"}`}
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
                className={`border ${errors.grossRevenue ? "border-destructive" : "border-primary"}`}
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
              className={`border ${errors.netRevenue ? "border-destructive" : "border-primary"}`}
            />
            {errors.netRevenue && <p className="text-xs text-destructive">{errors.netRevenue}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              <SaveIcon className="size-4" />
              Simpan Laporan
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}