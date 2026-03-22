"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BoxIcon, ImagePlusIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type Props = {
  onSubmit: (form: StockForm) => void
}

export type StockForm = {
  name: string
  quantity: string
  unit: string
  minStock: string
  maxStock: string
  image: string | null
}

export function CreateStockForm({ onSubmit }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<StockForm, "image">>({
    name: "",
    quantity: "",
    unit: "",
    minStock: "",
    maxStock: "",
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = () => {
    onSubmit({ ...form, image: preview })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

      <div className="flex flex-col gap-6 max-w-4xl">

        {/* Foto Bahan */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Foto bahan</Label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl cursor-pointer hover:border-primary transition-colors overflow-hidden min-h-60">
            {preview ? (
              <Image
                src={preview}
                alt="Foto bahan"
                width={800}
                height={240}
                className="w-full object-cover max-h-80"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                <ImagePlusIcon className="size-10" strokeWidth={1.5} />
                <p className="text-sm">Masukkan gambar bahan</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* Nama Bahan */}
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Nama bahan</Label>
          <Input
            placeholder="Masukkan nama bahan"
            value={form.name}
            onChange={handleChange("name")}
            className="border border-primary rounded-lg py-2"
          />
        </div>

        {/* Jumlah & Satuan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Jumlah bahan</Label>
            <Input
              type="number"
              placeholder="Masukkan jumlah bahan"
              value={form.quantity}
              onChange={handleChange("quantity")}
              className="border border-primary rounded-lg py-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Satuan bahan</Label>
            <Input
              placeholder="Masukkan satuan bahan"
              value={form.unit}
              onChange={handleChange("unit")}
              className="border border-primary rounded-lg py-2"
            />
          </div>
        </div>

        {/* Min & Max Stok */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Minimum stok bahan</Label>
            <Input
              type="number"
              placeholder="Masukkan minimum stok bahan"
              value={form.minStock}
              onChange={handleChange("minStock")}
              className="border border-primary rounded-lg py-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">Maksimum stok bahan</Label>
            <Input
              type="number"
              placeholder="Masukkan maksimum stok bahan"
              value={form.maxStock}
              onChange={handleChange("maxStock")}
              className="border border-primary rounded-lg py-2"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
          >
            <BoxIcon className="size-4" />
            Tambah Bahan
          </Button>
        </div>

      </div>
    </div>
  )
}