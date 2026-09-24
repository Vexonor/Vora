"use client"

import { RupiahInput } from "@/components/shared/rupiah-input"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toMenuFormValues, type MenuFormValues } from "@/lib/menu"
import { MENU_STATUS_OPTIONS, MENU_TYPE_OPTIONS } from "@/lib/menu-status"
import type { Menu } from "@/types/menu"
import { CirclePlusIcon, ImagePlusIcon, Loader2Icon, PencilIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type MenuFormErrors = Partial<Record<"name" | "price" | "type", string>>
type TextField = Exclude<keyof MenuFormValues, "image">

type Props = {
  initialMenu?: Menu
  isSubmitting?: boolean
  onSubmit: (values: MenuFormValues) => Promise<void>
}

export function MenuForm({ initialMenu, isSubmitting, onSubmit }: Props) {
  const [values, setValues] = useState<MenuFormValues>(() => toMenuFormValues(initialMenu))
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialMenu?.image_url ?? null)
  const [errors, setErrors] = useState<MenuFormErrors>({})
  const isEditMode = !!initialMenu

  const updateField = (field: TextField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setValues((previous) => ({ ...previous, image: file }))
    const reader = new FileReader()
    reader.onload = () => setImagePreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const validate = (): MenuFormErrors => {
    const validationErrors: MenuFormErrors = {}
    if (!values.name.trim()) validationErrors.name = "Nama menu tidak boleh kosong."
    if (!values.price || Number(values.price) <= 0) validationErrors.price = "Harga harus berupa angka lebih dari 0."
    if (!values.type) validationErrors.type = "Pilih tipe menu terlebih dahulu."
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-6 max-w-4xl">

        <div className="flex flex-col gap-2">
          <Label className="font-semibold">
            Foto menu{" "}
            {isEditMode && <span className="text-muted-foreground font-normal">(biarkan kosong jika tidak ingin mengubah)</span>}
          </Label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-primary/70 transition-colors overflow-hidden min-h-60">
            {imagePreviewUrl ? (
              <Image src={imagePreviewUrl} alt="Foto menu" width={800} height={240} className="w-full object-cover max-h-80" unoptimized />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                <ImagePlusIcon className="size-10" strokeWidth={1.5} />
                <p className="text-sm">Masukkan gambar menu</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama menu" error={errors.name} labelClassName="font-semibold">
            <Input
              placeholder="Masukkan nama menu"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={!!errors.name}
            />
          </FormField>
          <FormField label="Harga menu" error={errors.price} labelClassName="font-semibold">
            <RupiahInput
              value={values.price}
              onChange={(digits) => updateField("price", digits)}
              placeholder="Masukkan harga"
              hasError={!!errors.price}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Deskripsi menu" labelClassName="font-semibold">
            <Textarea
              placeholder="Masukkan deskripsi menu"
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="resize-none"
              rows={3}
            />
          </FormField>
          <FormField label="Tipe menu" error={errors.type} labelClassName="font-semibold">
            <Select value={values.type} onValueChange={(type) => updateField("type", type)}>
              <SelectTrigger aria-invalid={!!errors.type}>
                <SelectValue placeholder="Pilih tipe menu" />
              </SelectTrigger>
              <SelectContent>
                {MENU_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Harga modal" labelClassName="font-semibold" className="max-w-xs">
          <RupiahInput
            value={values.cost}
            onChange={(digits) => updateField("cost", digits)}
            placeholder="Masukkan harga modal (opsional)"
          />
        </FormField>

        {isEditMode && (
          <FormField label="Status menu" labelClassName="font-semibold" className="max-w-xs">
            <Select value={values.status} onValueChange={(status) => updateField("status", status)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status menu" />
              </SelectTrigger>
              <SelectContent>
                {MENU_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
          >
            {isSubmitting
              ? <Loader2Icon className="size-4 animate-spin" />
              : isEditMode ? <PencilIcon className="size-4" /> : <CirclePlusIcon className="size-4" />}
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Menu"}
          </Button>
        </div>

      </div>
    </div>
  )
}
