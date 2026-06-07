"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { authService } from "@/services/auth.service"
import type { User } from "@/types/user"
import { USER_ROLE_LABELS } from "@/types/user"
import { CameraIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2Icon, UserIcon } from "lucide-react"
import { useRef, useState } from "react"
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
  const { updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(user.avatar_url ?? null)
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initials = user.username.charAt(0).toUpperCase()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB.")
      return
    }
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e: { username?: string; email?: string } = {}
    if (!username.trim()) e.username = "Username tidak boleh kosong."
    if (!email.trim()) e.email = "Email tidak boleh kosong."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Format email tidak valid."
    return e
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const fd = new FormData()
    if (username.trim() !== user.username) fd.append("username", username.trim())
    if (email.trim() !== user.email) fd.append("email", email.trim())
    if (avatarFile) fd.append("avatar", avatarFile)

    if ([...fd.keys()].length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan.")
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await authService.updateProfile(fd)
      updateUser(updated)
      setAvatarFile(null)
      setPreview(updated.avatar_url ?? null)
      toast.success("Profil berhasil diperbarui.")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg === "Email sudah digunakan") {
        setErrors({ email: "Email sudah digunakan." })
      } else {
        toast.error("Gagal memperbarui profil. Coba lagi.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group rounded-full"
        >
          <Avatar className="size-20">
            <AvatarImage src={preview ?? undefined} alt={user.username} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <CameraIcon className="size-6 text-white" />
          </span>
          <span className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-background">
            <CameraIcon className="size-3.5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-primary hover:underline"
        >
          Ubah foto profil
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        <FormField label="Username" error={errors.username}>
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setErrors((prev) => ({ ...prev, username: undefined }))
            }}
            placeholder="Masukkan username"
            aria-invalid={!!errors.username}
            maxLength={100}
          />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            placeholder="Masukkan email"
            aria-invalid={!!errors.email}
            maxLength={150}
          />
        </FormField>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Role</Label>
          <p className="text-sm font-medium border border-foreground/20 rounded-lg px-3 py-2 bg-muted/30 text-muted-foreground">
            {USER_ROLE_LABELS[user.role] ?? user.role_name}
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-white flex items-center gap-2"
      >
        {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
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
