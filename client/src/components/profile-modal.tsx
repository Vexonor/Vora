"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import type { User } from "@/types/user"
import { USER_ROLE_LABELS } from "@/types/user"
import { CheckCircleIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2Icon, UserIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Tab = "info" | "password"

type PasswordForm = {
  current_password: string
  new_password: string
  confirm_password: string
}

type PasswordErrors = Partial<PasswordForm>

type Props = {
  user: User
  initialTab?: Tab
  onClose: () => void
}

function InfoTab({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-primary">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-base">{user.username}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { label: "Username", value: user.username },
          { label: "Email", value: user.email },
          { label: "Role", value: USER_ROLE_LABELS[user.role] ?? user.role_name },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <p className="text-sm font-medium border border-foreground/20 rounded-lg px-3 py-2 bg-muted/30">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PasswordTab() {
  const [form, setForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = (): PasswordErrors => {
    const e: PasswordErrors = {}
    if (!form.current_password) e.current_password = "Masukkan password saat ini."
    if (!form.new_password) e.new_password = "Masukkan password baru."
    else if (form.new_password.length < 8) e.new_password = "Minimal 8 karakter."
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.new_password))
      e.new_password = "Harus mengandung huruf besar, kecil, dan angka."
    if (!form.confirm_password) e.confirm_password = "Konfirmasi password baru."
    else if (form.confirm_password !== form.new_password)
      e.confirm_password = "Password tidak cocok."
    return e
  }

  const handleChange = (key: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setIsSubmitting(true)
    try {
      await authService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg === "INVALID_CURRENT_PASSWORD") {
        setErrors({ current_password: "Password saat ini salah." })
      } else {
        toast.error("Gagal mengganti password. Coba lagi.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircleIcon className="size-7 text-primary" />
        </div>
        <div>
          <p className="font-semibold">Password berhasil diubah</p>
          <p className="text-sm text-muted-foreground mt-1">Gunakan password baru saat login berikutnya.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {[
        { key: "current_password" as const, label: "Password Saat Ini", showKey: "current" as const },
        { key: "new_password" as const, label: "Password Baru", showKey: "new" as const },
        { key: "confirm_password" as const, label: "Konfirmasi Password Baru", showKey: "confirm" as const },
      ].map(({ key, label, showKey }) => (
        <FormField key={key} label={label} error={errors[key]}>
          <div className="relative">
            <Input
              type={show[showKey] ? "text" : "password"}
              placeholder={`Masukkan ${label.toLowerCase()}`}
              value={form[key]}
              onChange={handleChange(key)}
              aria-invalid={!!errors[key]}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((prev) => ({ ...prev, [showKey]: !prev[showKey] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show[showKey] ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </FormField>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-white mt-1 flex items-center gap-2"
      >
        {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
        {isSubmitting ? "Menyimpan..." : "Simpan Password"}
      </Button>
    </div>
  )
}

export function ProfileModal({ user, initialTab = "info", onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: "info", label: "Profil", icon: <UserIcon className="size-4" /> },
    { value: "password", label: "Ganti Password", icon: <KeyRoundIcon className="size-4" /> },
  ]

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profil Saya</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b border-foreground/10 mb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 border-b-2 transition-colors
                ${activeTab === tab.value
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-1">
          {activeTab === "info" ? <InfoTab user={user} /> : <PasswordTab />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
