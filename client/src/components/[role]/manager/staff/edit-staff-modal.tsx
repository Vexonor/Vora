"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userService } from "@/services/user.service"
import { UserRole, type User } from "@/types/user"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const ROLE_OPTIONS = [
  { value: String(UserRole.CASHIER), label: "Kasir" },
  { value: String(UserRole.KITCHEN), label: "Kitchen" },
  { value: String(UserRole.MANAGER), label: "Manager" },
]

type StaffForm = { username: string; email: string; role: string }
type StaffFormErrors = { username?: string; email?: string; role?: string }

type Props = {
  staff: User
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function EditStaffModal({ staff, onClose, onSaved }: Props) {
  const [form, setForm] = useState<StaffForm>({
    username: staff.username,
    email: staff.email,
    role: String(staff.role),
  })
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): StaffFormErrors => {
    const e: StaffFormErrors = {}
    if (!form.username.trim()) e.username = "Username tidak boleh kosong."
    if (!form.email.trim()) e.email = "Email tidak boleh kosong."
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid."
    if (!form.role) e.role = "Pilih role terlebih dahulu."
    return e
  }

  const handleChange = (key: keyof StaffForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsSubmitting(true)
    try {
      await userService.update(staff.id, {
        username: form.username.trim(),
        email: form.email.trim(),
        role: Number(form.role),
      })
      toast.success("Data staff berhasil diperbarui.")
      await onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui staff. Coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit staff</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <FormField label="Username" error={errors.username}>
            <Input
              autoFocus
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange("username")}
              aria-invalid={!!errors.username}
            />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <Input
              type="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange("email")}
              aria-invalid={!!errors.email}
            />
          </FormField>
          <FormField label="Role" error={errors.role}>
            <Select
              value={form.role}
              onValueChange={(val) => {
                setForm((prev) => ({ ...prev, role: val }))
                setErrors((prev) => ({ ...prev, role: undefined }))
              }}
            >
              <SelectTrigger aria-invalid={!!errors.role}>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
