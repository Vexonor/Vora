"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole } from "@/types/user"
import { CheckCircleIcon, CopyIcon, Loader2Icon, UserPlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const ROLE_OPTIONS = [
  { value: String(UserRole.CASHIER), label: "Kasir" },
  { value: String(UserRole.KITCHEN), label: "Kitchen" },
  { value: String(UserRole.MANAGER), label: "Manager" },
]

type StaffForm = {
  username: string
  email: string
  role: string | ""
}

type StaffFormErrors = {
  username?: string
  email?: string
  role?: string
}

type SubmitResult = { error: string | null; defaultPassword?: string }

type Props = {
  onSubmit: (form: StaffForm) => Promise<SubmitResult>
  onClose: () => void
}

export function AddStaffModal({ onSubmit, onClose }: Props) {
  const [form, setForm] = useState<StaffForm>({ username: "", email: "", role: "" })
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultPassword, setDefaultPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const validate = () => {
    const newErrors: StaffFormErrors = {}
    if (!form.username.trim()) newErrors.username = "Username tidak boleh kosong."
    if (!form.email.trim()) newErrors.email = "Email tidak boleh kosong."
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Format email tidak valid."
    if (!form.role) newErrors.role = "Pilih role terlebih dahulu."
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setIsSubmitting(true)
    const result = await onSubmit(form)
    setIsSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.defaultPassword) {
      setDefaultPassword(result.defaultPassword)
    }
  }

  const handleCopy = () => {
    if (!defaultPassword) return
    navigator.clipboard.writeText(defaultPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleChange = (key: keyof StaffForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  if (defaultPassword) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Staff Berhasil Ditambahkan</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircleIcon className="size-7 text-primary" />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                Akun <span className="font-semibold text-foreground">{form.username}</span> berhasil dibuat.
              </p>
              <p className="text-sm text-muted-foreground">
                Bagikan password default berikut kepada staff:
              </p>
            </div>

            <div className="w-full flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
              <span className="flex-1 font-mono font-semibold text-foreground tracking-widest">
                {defaultPassword}
              </span>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Salin password"
              >
                <CopyIcon className="size-4" />
              </button>
            </div>

            {copied && (
              <p className="text-xs text-primary -mt-2">Password disalin!</p>
            )}

            <p className="text-xs text-muted-foreground">
              Staff dapat mengganti password setelah login pertama kali.
            </p>
          </div>

          <Button onClick={onClose} className="w-full">Selesai</Button>
        </DialogContent>
      </Dialog>
    )
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
              aria-invalid={!!errors.username}
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
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Role</Label>
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
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <UserPlusIcon className="size-4" />
              )}
              {isSubmitting ? "Menambahkan..." : "Tambah Staff"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
