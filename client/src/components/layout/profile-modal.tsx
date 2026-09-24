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
import { getUserRoleDisplay } from "@/lib/user-role"
import { CameraIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2Icon, UserIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export type ProfileTab = "info" | "password"

type PasswordForm = {
  current_password: string
  new_password: string
  confirm_password: string
}

type PasswordErrors = Partial<PasswordForm>

type Props = {
  user: User
  initialTab?: ProfileTab
  onClose: () => void
}

function ProfileInfoTab({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(user.avatar_url ?? null)
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewObjectUrlRef = useRef<string | null>(null)

  const initials = user.username.charAt(0).toUpperCase()

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB.")
      return
    }
    if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = objectUrl
    setAvatarFile(file)
    setPreview(objectUrl)
  }

  const validate = () => {
    const validationErrors: { username?: string; email?: string } = {}
    if (!username.trim()) validationErrors.username = "Username tidak boleh kosong."
    if (!email.trim()) validationErrors.email = "Email tidak boleh kosong."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      validationErrors.email = "Format email tidak valid."
    return validationErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const profileFormData = new FormData()
    if (username.trim() !== user.username) profileFormData.append("username", username.trim())
    if (email.trim() !== user.email) profileFormData.append("email", email.trim())
    if (avatarFile) profileFormData.append("avatar", avatarFile)

    if ([...profileFormData.keys()].length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan.")
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await authService.updateProfile(profileFormData)
      updateUser(updated)
      setAvatarFile(null)
      setPreview(updated.avatar_url ?? null)
      toast.success("Profil berhasil diperbarui.")
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (errorMessage === "Email sudah digunakan") {
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

      <div className="flex flex-col gap-4">
        <FormField label="Username" error={errors.username}>
          <Input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setErrors((previous) => ({ ...previous, username: undefined }))
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
            onChange={(event) => {
              setEmail(event.target.value)
              setErrors((previous) => ({ ...previous, email: undefined }))
            }}
            placeholder="Masukkan email"
            aria-invalid={!!errors.email}
            maxLength={150}
          />
        </FormField>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Role</Label>
          <p className="text-sm font-medium border border-foreground/20 rounded-lg px-3 py-2 bg-muted/30 text-muted-foreground">
            {getUserRoleDisplay(user.role, user.role_name).label}
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

function ChangePasswordTab() {
  const [form, setForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = (): PasswordErrors => {
    const validationErrors: PasswordErrors = {}
    if (!form.current_password) validationErrors.current_password = "Masukkan password saat ini."
    if (!form.new_password) validationErrors.new_password = "Masukkan password baru."
    else if (form.new_password.length < 8) validationErrors.new_password = "Minimal 8 karakter."
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.new_password))
      validationErrors.new_password = "Harus mengandung huruf besar, kecil, dan angka."
    if (!form.confirm_password) validationErrors.confirm_password = "Konfirmasi password baru."
    else if (form.confirm_password !== form.new_password)
      validationErrors.confirm_password = "Password tidak cocok."
    return validationErrors
  }

  const handleChange = (key: keyof PasswordForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setIsSubmitting(true)
    try {
      await authService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess(true)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (errorMessage === "INVALID_CURRENT_PASSWORD") {
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
        { key: "current_password" as const, label: "Password Saat Ini", visibilityKey: "current" as const },
        { key: "new_password" as const, label: "Password Baru", visibilityKey: "new" as const },
        { key: "confirm_password" as const, label: "Konfirmasi Password Baru", visibilityKey: "confirm" as const },
      ].map(({ key, label, visibilityKey }) => (
        <FormField key={key} label={label} error={errors[key]}>
          <div className="relative">
            <Input
              type={passwordVisibility[visibilityKey] ? "text" : "password"}
              placeholder={`Masukkan ${label.toLowerCase()}`}
              value={form[key]}
              onChange={handleChange(key)}
              aria-invalid={!!errors[key]}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setPasswordVisibility((previous) => ({ ...previous, [visibilityKey]: !previous[visibilityKey] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {passwordVisibility[visibilityKey] ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
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
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

  const tabs: { value: ProfileTab; label: string; icon: React.ReactNode }[] = [
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
          {activeTab === "info" ? <ProfileInfoTab user={user} /> : <ChangePasswordTab />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
