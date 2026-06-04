"use client"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { BoxIcon, CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { cn } from "@/lib/utils"
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
  onSubmit: (form: StockForm) => Promise<void>
  isSubmitting?: boolean
  initialValues?: Partial<StockForm>
  submitLabel?: string
}

export type StockForm = {
  name: string
  quantity: string
  unit: string
  minStock: string
  maxStock: string
}

type StockFormErrors = { name?: string; quantity?: string; unit?: string }

export function CreateStockForm({ onSubmit, isSubmitting, initialValues, submitLabel }: Props) {
  const [units, setUnits] = useState<Unit[]>([])
  const [openUnit, setOpenUnit] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)
  const [form, setForm] = useState<StockForm>({
    name: initialValues?.name ?? "",
    quantity: initialValues?.quantity ?? "",
    unit: initialValues?.unit ?? "",
    minStock: initialValues?.minStock ?? "",
    maxStock: initialValues?.maxStock ?? "",
  })
  const [errors, setErrors] = useState<StockFormErrors>({})

  useEffect(() => {
    unitService.getAll()
      .then(setUnits)
      .catch((err) => console.error("Failed to load units:", err))
      .finally(() => setIsLoadingUnits(false))
  }, [])

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): StockFormErrors => {
    const e: StockFormErrors = {}
    if (!form.name.trim()) e.name = "Nama bahan tidak boleh kosong."
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = "Jumlah harus berupa angka valid."
    if (!form.unit) e.unit = "Pilih satuan bahan terlebih dahulu."
    return e
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    await onSubmit(form)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-6 max-w-4xl">

        <FormField label="Nama bahan" error={errors.name} labelClassName="font-semibold">
          <Input
            placeholder="Masukkan nama bahan"
            value={form.name}
            onChange={handleChange("name")}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Jumlah bahan" error={errors.quantity} labelClassName="font-semibold">
            <Input
              type="number"
              placeholder="Masukkan jumlah bahan"
              value={form.quantity}
              onChange={handleChange("quantity")}
              aria-invalid={!!errors.quantity}
            />
          </FormField>
          <FormField label="Satuan bahan" error={errors.unit} labelClassName="font-semibold">
            <Popover open={openUnit} onOpenChange={setOpenUnit}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUnit}
                  className={cn(
                    "w-full justify-between text-foreground/80 hover:bg-transparent",
                    errors.unit && "border-destructive"
                  )}
                  disabled={isLoadingUnits}
                >
                  {form.unit
                    ? units.find((u) => u.id.toString() === form.unit)?.name
                    : isLoadingUnits ? "Memuat satuan..." : "Pilih satuan..."}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari satuan..." />
                  <CommandList>
                    <CommandEmpty>Satuan tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {units.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={u.name}
                          onSelect={() => {
                            setForm((prev) => ({ ...prev, unit: u.id.toString() }))
                            setErrors((prev) => ({ ...prev, unit: undefined }))
                            setOpenUnit(false)
                          }}
                        >
                          <CheckIcon className={cn("mr-2 h-4 w-4", form.unit === u.id.toString() ? "opacity-100" : "opacity-0")} />
                          {u.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField labelClassName="font-semibold" label="Minimum stok (opsional)">
            <Input
              type="number"
              placeholder="Masukkan minimum stok"
              value={form.minStock}
              onChange={handleChange("minStock")}
            />
          </FormField>
          <FormField labelClassName="font-semibold" label="Maksimum stok (opsional)">
            <Input
              type="number"
              placeholder="Masukkan maksimum stok"
              value={form.maxStock}
              onChange={handleChange("maxStock")}
            />
          </FormField>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <BoxIcon className="size-4" />}
            {isSubmitting ? "Menyimpan..." : (submitLabel ?? "Tambah Bahan")}
          </Button>
        </div>

      </div>
    </div>
  )
}
