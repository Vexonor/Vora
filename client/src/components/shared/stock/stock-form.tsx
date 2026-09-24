"use client"

import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import type { StockFormValues } from "@/lib/stock"
import { cn } from "@/lib/utils"
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { BoxIcon, CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type StockFormErrors = Partial<Record<"name" | "quantity" | "unitId", string>>

const EMPTY_VALUES: StockFormValues = {
  name: "",
  quantity: "",
  unitId: "",
  minimumQuantity: "",
  maximumQuantity: "",
}

type Props = {
  initialValues?: StockFormValues
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: StockFormValues) => Promise<void>
}

export function StockForm({ initialValues = EMPTY_VALUES, isSubmitting, submitLabel = "Tambah Bahan", onSubmit }: Props) {
  const [units, setUnits] = useState<Unit[]>([])
  const [isUnitPickerOpen, setIsUnitPickerOpen] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)
  const [values, setValues] = useState<StockFormValues>(initialValues)
  const [errors, setErrors] = useState<StockFormErrors>({})

  useEffect(() => {
    unitService.getAll()
      .then(setUnits)
      .catch(() => toast.error("Gagal memuat daftar satuan."))
      .finally(() => setIsLoadingUnits(false))
  }, [])

  const updateField = (field: keyof StockFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const validate = (): StockFormErrors => {
    const validationErrors: StockFormErrors = {}
    if (!values.name.trim()) validationErrors.name = "Nama bahan tidak boleh kosong."
    const quantity = Number(values.quantity)
    if (values.quantity === "" || isNaN(quantity) || quantity < 0)
      validationErrors.quantity = "Jumlah harus berupa angka valid."
    if (!values.unitId) validationErrors.unitId = "Pilih satuan bahan terlebih dahulu."
    return validationErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    await onSubmit(values)
  }

  const selectedUnitName = units.find((unit) => String(unit.id) === values.unitId)?.name

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-6 max-w-4xl">

        <FormField label="Nama bahan" error={errors.name} labelClassName="font-semibold">
          <Input
            placeholder="Masukkan nama bahan"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Jumlah bahan" error={errors.quantity} labelClassName="font-semibold">
            <Input
              type="number"
              placeholder="Masukkan jumlah bahan"
              value={values.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              aria-invalid={!!errors.quantity}
            />
          </FormField>
          <FormField label="Satuan bahan" error={errors.unitId} labelClassName="font-semibold">
            <Popover open={isUnitPickerOpen} onOpenChange={setIsUnitPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isUnitPickerOpen}
                  className={cn(
                    "w-full justify-between text-foreground/80 hover:bg-transparent",
                    errors.unitId && "border-destructive"
                  )}
                  disabled={isLoadingUnits}
                >
                  {values.unitId
                    ? selectedUnitName
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
                      {units.map((unit) => (
                        <CommandItem
                          key={unit.id}
                          value={unit.name}
                          onSelect={() => {
                            updateField("unitId", String(unit.id))
                            setIsUnitPickerOpen(false)
                          }}
                        >
                          <CheckIcon className={cn("mr-2 h-4 w-4", values.unitId === String(unit.id) ? "opacity-100" : "opacity-0")} />
                          {unit.name}
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
              value={values.minimumQuantity}
              onChange={(event) => updateField("minimumQuantity", event.target.value)}
            />
          </FormField>
          <FormField labelClassName="font-semibold" label="Maksimum stok (opsional)">
            <Input
              type="number"
              placeholder="Masukkan maksimum stok"
              value={values.maximumQuantity}
              onChange={(event) => updateField("maximumQuantity", event.target.value)}
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
            {isSubmitting ? "Menyimpan..." : submitLabel}
          </Button>
        </div>

      </div>
    </div>
  )
}
