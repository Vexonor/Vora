"use client"

import { Button } from "@/components/ui/button"
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
}

export function ReportForm({ onSubmit }: Props) {
  const [form, setForm] = useState<ReportForm>({
    title: "",
    date: "",
    totalTransactions: "",
    totalProducts: "",
    capital: "",
    grossRevenue: "",
    netRevenue: "",
  })
  const [errors, setErrors] = useState<ReportFormErrors>({})
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)
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
    setForm({
      title: "", date: "", totalTransactions: "", totalProducts: "",
      capital: "", grossRevenue: "", netRevenue: "",
    })
    setSuccess(true)
  }

  return (
    <div className="bg-white rounded-xl border border-foreground/10 p-5 flex flex-col gap-4">
      <p className="font-semibold text-base">Tambah laporan</p>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Judul laporan</Label>
        <Input
          placeholder="Masukkan judul laporan"
          value={form.title}
          onChange={handleChange("title")}
          className={`border ${errors.title ? "border-destructive" : "border-primary"}`}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Tanggal laporan</Label>
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
          <Label className="text-sm font-medium">Total transaksi</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.totalTransactions}
            onChange={handleChange("totalTransactions")}
            className={`border ${errors.totalTransactions ? "border-destructive" : "border-primary"}`}
          />
          {errors.totalTransactions && <p className="text-xs text-destructive">{errors.totalTransactions}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Total produk terjual</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.totalProducts}
            onChange={handleChange("totalProducts")}
            className={`border ${errors.totalProducts ? "border-destructive" : "border-primary"}`}
          />
          {errors.totalProducts && <p className="text-xs text-destructive">{errors.totalProducts}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Modal</Label>
          <Input
            type="number"
            placeholder="Rp 0"
            value={form.capital}
            onChange={handleChange("capital")}
            className={`border ${errors.capital ? "border-destructive" : "border-primary"}`}
          />
          {errors.capital && <p className="text-xs text-destructive">{errors.capital}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Pendapatan kotor</Label>
          <Input
            type="number"
            placeholder="Rp 0"
            value={form.grossRevenue}
            onChange={handleChange("grossRevenue")}
            className={`border ${errors.grossRevenue ? "border-destructive" : "border-primary"}`}
          />
          {errors.grossRevenue && <p className="text-xs text-destructive">{errors.grossRevenue}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">Pendapatan bersih</Label>
        <Input
          type="number"
          placeholder="Rp 0"
          value={form.netRevenue}
          onChange={handleChange("netRevenue")}
          className={`border ${errors.netRevenue ? "border-destructive" : "border-primary"}`}
        />
        {errors.netRevenue && <p className="text-xs text-destructive">{errors.netRevenue}</p>}
      </div>

      {success && (
        <p className="text-xs text-success font-medium">Laporan berhasil ditambahkan.</p>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
      >
        <SaveIcon className="size-4" />
        Simpan Laporan
      </Button>
    </div>
  )
}