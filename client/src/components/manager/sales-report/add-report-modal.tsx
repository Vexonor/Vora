"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { useCreateSellingReport } from "@/hooks/queries/use-selling-reports"
import { getApiErrorMessage } from "@/lib/api-error"
import { formatNumber, formatThousands, stripNonDigits } from "@/lib/format"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type ReportFormValues = {
  title: string
  date: string
  totalTransactions: string
  totalItemsSold: string
  unitCost: string
  operationalCost: string
  grossRevenue: string
}

type ReportFormErrors = Partial<Record<keyof ReportFormValues, string>>

const EMPTY_VALUES: ReportFormValues = {
  title: "",
  date: "",
  totalTransactions: "",
  totalItemsSold: "",
  unitCost: "",
  operationalCost: "",
  grossRevenue: "",
}

const REQUIRED_NUMBER_FIELDS: (keyof ReportFormValues)[] = [
  "totalTransactions",
  "totalItemsSold",
  "unitCost",
  "grossRevenue",
  "operationalCost",
]

function validateReportForm(values: ReportFormValues): ReportFormErrors {
  const errors: ReportFormErrors = {}
  if (!values.title.trim()) errors.title = "Judul tidak boleh kosong."
  if (!values.date) errors.date = "Tanggal tidak boleh kosong."
  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (!values[field] || isNaN(Number(values[field]))) errors[field] = "Tidak valid."
  }
  return errors
}

export function AddReportModal({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<ReportFormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<ReportFormErrors>({})
  const createSellingReport = useCreateSellingReport()

  const updateField = (field: keyof ReportFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const estimatedNetProfit =
    Number(values.grossRevenue || 0) - Number(values.unitCost || 0) - Number(values.operationalCost || 0)

  const handleSubmit = () => {
    const validationErrors = validateReportForm(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    createSellingReport.mutate(
      {
        title: values.title.trim(),
        date: values.date,
        total_transaction: Number(values.totalTransactions),
        total_items_sold: Number(values.totalItemsSold),
        unit_cost: Number(values.unitCost),
        operational_cost: Number(values.operationalCost),
        gross_revenue: Number(values.grossRevenue),
      },
      {
        onSuccess: () => {
          toast.success("Laporan berhasil dibuat.")
          onClose()
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal membuat laporan. Silakan coba lagi.")),
      },
    )
  }

  const renderMoneyInput = (field: keyof ReportFormValues, placeholder: string) => (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={formatThousands(values[field])}
      onChange={(event) => updateField(field, stripNonDigits(event.target.value))}
      aria-invalid={!!errors[field]}
    />
  )

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
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              aria-invalid={!!errors.title}
            />
          </FormField>

          <FormField label="Tanggal laporan penjualan" error={errors.date}>
            <Input
              type="date"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
              aria-invalid={!!errors.date}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total transaksi" error={errors.totalTransactions}>
              <Input
                type="number"
                placeholder="Masukkan total transaksi"
                value={values.totalTransactions}
                onChange={(event) => updateField("totalTransactions", event.target.value)}
                aria-invalid={!!errors.totalTransactions}
              />
            </FormField>
            <FormField label="Total produk yang terjual" error={errors.totalItemsSold}>
              <Input
                type="number"
                placeholder="Masukkan total produk"
                value={values.totalItemsSold}
                onChange={(event) => updateField("totalItemsSold", event.target.value)}
                aria-invalid={!!errors.totalItemsSold}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="HPP (modal bahan)" error={errors.unitCost}>
              {renderMoneyInput("unitCost", "Masukkan jumlah modal")}
            </FormField>
            <FormField label="Pendapatan kotor" error={errors.grossRevenue}>
              {renderMoneyInput("grossRevenue", "Masukkan jumlah pendapatan kotor")}
            </FormField>
          </div>

          <FormField label="Modal operasional" error={errors.operationalCost}>
            {renderMoneyInput("operationalCost", "Belanja harian, gas, kemasan, dll.")}
          </FormField>

          <div className="rounded-lg bg-muted/30 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pendapatan bersih (otomatis)</span>
            <span className="text-sm font-semibold">Rp {formatNumber(estimatedNetProfit)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={createSellingReport.isPending}
              className="bg-secondary text-white hover:bg-secondary/90 flex items-center gap-2"
            >
              {createSellingReport.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {createSellingReport.isPending ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
