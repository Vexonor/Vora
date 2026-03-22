"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STAFF_ROLE_OPTIONS, StaffRole } from "@/lib/constant/staff"
import { UserPlusIcon } from "lucide-react"
import { useState } from "react"

type StaffForm = {
  username: string
  email: string
  role: StaffRole | ""
}

type Props = {
  onSubmit: (form: StaffForm) => string | null
  onClose: () => void
}

export function AddStaffModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<StaffForm>({
    username: "",
    email: "",
    role: "",
  })

  type StaffFormErrors = {
    username?: string
    email?: string
    role?: string
  }

  const [errors, setErrors] = useState<StaffFormErrors>({})

  const validate = () => {
    const newErrors: StaffFormErrors = {}
    if (!form.username.trim()) newErrors.username = "Username tidak boleh kosong."
    if (!form.email.trim()) newErrors.email = "Email tidak boleh kosong."
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Format email tidak valid."
    if (!form.role) newErrors.role = "Pilih role terlebih dahulu."
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const errorMsg = onSubmit(form)
    if (errorMsg) {
      setErrors({ email: errorMsg })
      return
    }
    onClose()
  }

  const handleChange = (key: keyof StaffForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah staff baru</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Username</Label>
            <Input
              autoFocus
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange("username")}
              className={`border ${errors.username ? "border-destructive" : "border-primary"}`}
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Email</Label>
            <Input
              type="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange("email")}
              className={`border ${errors.email ? "border-destructive" : "border-primary"}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Role</Label>
            <Select
              value={form.role}
              onValueChange={(val) => {
                setForm((prev) => ({ ...prev, role: val as StaffRole }))
                setErrors((prev) => ({ ...prev, role: undefined }))
              }}
            >
              <SelectTrigger className={`border ${errors.role ? "border-destructive" : "border-primary"}`}>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              <UserPlusIcon className="size-4" />
              Tambah Staff
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}