"use client"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Menu, MenuStatus, MenuType } from "@/types/menu"
import { CirclePlusIcon, ImagePlusIcon, Loader2Icon, PencilIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const MENU_TYPE_OPTIONS = [
  { value: String(MenuType.FOOD), label: "Makanan" },
  { value: String(MenuType.HOT_DRINK), label: "Minuman Panas" },
  { value: String(MenuType.COLD_DRINK), label: "Minuman Dingin" },
  { value: String(MenuType.SNACK), label: "Cemilan" },
]

const MENU_STATUS_OPTIONS = [
  { value: String(MenuStatus.AVAILABLE), label: "Tersedia" },
  { value: String(MenuStatus.SOLD_OUT), label: "Habis" },
  { value: String(MenuStatus.INACTIVE), label: "Tidak Aktif" },
]

export type MenuFormData = {
  name: string
  price: string
  cost?: string
  description: string
  type: string
  status?: string
  image: File | null
}

type MenuFormErrors = { name?: string; price?: string; type?: string }

type Props = {
  onSubmit: (form: MenuFormData) => Promise<void>
  isSubmitting?: boolean
  initialData?: Menu
}

export function MenuForm({ onSubmit, isSubmitting, initialData }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<File | null>(null)
  const [form, setForm] = useState<Omit<MenuFormData, "image">>({
    name: "", price: "", cost: "", description: "", type: "", status: "",
  })
  const [errors, setErrors] = useState<MenuFormErrors>({})

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        price: String(initialData.price),
        cost: String(initialData.cost ?? ""),
        description: initialData.description ?? "",
        type: String(initialData.type),
        status: String(initialData.status),
      })
      if (initialData.image_url) setPreview(initialData.image_url)
    }
  }, [initialData])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    fileRef.current = file
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleChange = (key: keyof Omit<MenuFormData, "image" | "type">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  const validate = (): MenuFormErrors => {
    const e: MenuFormErrors = {}
    if (!form.name.trim()) e.name = "Nama menu tidak boleh kosong."
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Harga harus berupa angka lebih dari 0."
    if (!form.type) e.type = "Pilih tipe menu terlebih dahulu."
    return e
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    await onSubmit({ ...form, image: fileRef.current })
  }

  const isEdit = !!initialData

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-6 max-w-4xl">

        {/* Foto Menu */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">
            Foto menu{" "}
            {isEdit && <span className="text-muted-foreground font-normal">(biarkan kosong jika tidak ingin mengubah)</span>}
          </Label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-primary/70 transition-colors overflow-hidden min-h-60">
            {preview ? (
              <Image src={preview} alt="Foto menu" width={800} height={240} className="w-full object-cover max-h-80" unoptimized />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                <ImagePlusIcon className="size-10" strokeWidth={1.5} />
                <p className="text-sm">Masukkan gambar menu</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* Nama & Harga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama menu" error={errors.name} labelClassName="font-semibold">
            <Input
              placeholder="Masukkan nama menu"
              value={form.name}
              onChange={handleChange("name")}
              aria-invalid={!!errors.name}
            />
          </FormField>
          <FormField label="Harga menu" error={errors.price} labelClassName="font-semibold">
            <div className={`flex items-center border rounded-md overflow-hidden transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 ${errors.price ? "border-destructive" : "border-input"}`}>
              <span className="px-3 text-sm text-muted-foreground border-r border-input bg-muted h-full flex items-center">Rp.</span>
              <Input
                type="number"
                placeholder="Masukkan harga"
                value={form.price}
                onChange={handleChange("price")}
                className="border-0 rounded-none focus-visible:ring-0 shadow-none"
              />
            </div>
          </FormField>
        </div>

        {/* Deskripsi & Tipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Deskripsi menu" labelClassName="font-semibold">
            <Textarea
              placeholder="Masukkan deskripsi menu"
              value={form.description}
              onChange={handleChange("description")}
              className="resize-none"
              rows={3}
            />
          </FormField>
          <FormField label="Tipe menu" error={errors.type} labelClassName="font-semibold">
            <Select
              value={form.type}
              onValueChange={(val) => {
                setForm((prev) => ({ ...prev, type: val }))
                setErrors((prev) => ({ ...prev, type: undefined }))
              }}
            >
              <SelectTrigger aria-invalid={!!errors.type}>
                <SelectValue placeholder="Pilih tipe menu" />
              </SelectTrigger>
              <SelectContent>
                {MENU_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Harga Modal */}
        <FormField
          label="Harga modal"
          labelClassName="font-semibold"
          className="max-w-xs"
        >
          <div className="flex items-center border border-input rounded-md overflow-hidden transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="px-3 text-sm text-muted-foreground border-r border-input bg-muted h-full flex items-center">Rp.</span>
            <Input
              type="number"
              placeholder="Masukkan harga modal (opsional)"
              value={form.cost}
              onChange={handleChange("cost")}
              className="border-0 rounded-none focus-visible:ring-0 shadow-none"
            />
          </div>
        </FormField>

        {/* Status — hanya muncul saat mode edit */}
        {isEdit && (
          <FormField label="Status menu" labelClassName="font-semibold" className="max-w-xs">
            <Select
              value={form.status}
              onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status menu" />
              </SelectTrigger>
              <SelectContent>
                {MENU_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : isEdit ? <PencilIcon className="size-4" /> : <CirclePlusIcon className="size-4" />}
            {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Menu"}
          </Button>
        </div>

      </div>
    </div>
  )
}
