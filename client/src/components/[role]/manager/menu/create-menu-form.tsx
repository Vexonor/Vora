"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MENU_CATEGORY_OPTIONS, MenuCategory } from "@/lib/constant/menu"
import { CirclePlusIcon, ImagePlusIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export type MenuForm = {
  name: string
  price: string
  description: string
  category: MenuCategory | ""
  image: string | null
}

type Props = {
  onSubmit: (form: MenuForm) => void
}

export function CreateMenuForm({ onSubmit }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<MenuForm, "image">>({
    name: "",
    price: "",
    description: "",
    category: "",
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleChange = (key: keyof Omit<MenuForm, "image" | "ingredients" | "category">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const handleSubmit = () => {
    onSubmit({ ...form, image: preview })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

      <div className="flex flex-col gap-6 max-w-4xl">

        {/* Foto Menu */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Foto menu</Label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl cursor-pointer hover:border-primary/70 transition-colors overflow-hidden min-h-60">
            {preview ? (
              <Image
                src={preview}
                alt="Foto menu"
                width={800}
                height={240}
                className="w-full object-cover max-h-80"
              />
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
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Nama menu</Label>
            <Input
              placeholder="Masukkan nama menu"
              value={form.name}
              onChange={handleChange("name")}
              className="border border-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Harga menu</Label>
            <div className="flex items-center border border-primary rounded-lg overflow-hidden">
              <span className="px-3 text-sm text-muted-foreground border-r border-primary bg-muted">Rp.</span>
              <Input
                type="number"
                placeholder="Masukkan harga menu contoh:(10000)"
                value={form.price}
                onChange={handleChange("price")}
                className="border-0 rounded-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Deskripsi & Tipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Deskripsi menu</Label>
            <Textarea
              placeholder="Masukkan deskripsi menu"
              value={form.description}
              onChange={handleChange("description")}
              className="border border-primary resize-none"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Tipe menu</Label>
            <Select
              value={form.category}
              onValueChange={(val) => setForm((prev) => ({ ...prev, category: val as MenuCategory }))}
            >
              <SelectTrigger className="border border-primary">
                <SelectValue placeholder="Pilih tipe menu" />
              </SelectTrigger>
              <SelectContent>
                {MENU_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
          >
            <CirclePlusIcon className="size-4" />
            Tambah Menu
          </Button>
        </div>

      </div>
    </div>
  )
}