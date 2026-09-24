"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/lib/api-error"
import { authService } from "@/services/auth.service"
import { CheckCircleIcon, CopyIcon, Loader2Icon, UserPlusIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  StaffFormFields,
  validateStaffForm,
  type StaffFormErrors,
  type StaffFormValues,
} from "./staff-form-fields"

type Props = {
  onCreated: () => void
  onClose: () => void
}

export function AddStaffModal({ onCreated, onClose }: Props) {
  const [values, setValues] = useState<StaffFormValues>({ username: "", email: "", role: "" })
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultPassword, setDefaultPassword] = useState<string | null>(null)
  const [isPasswordCopied, setIsPasswordCopied] = useState(false)
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current)
    }
  }, [])

  const handleFieldChange = (field: keyof StaffFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const validationErrors = validateStaffForm(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsSubmitting(true)
    try {
      const createdStaff = await authService.register({
        username: values.username.trim(),
        email: values.email.trim(),
        role: Number(values.role),
      })
      setDefaultPassword(createdStaff.default_password)
      onCreated()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal menambahkan staf. Silakan coba lagi."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyPassword = async () => {
    if (!defaultPassword) return
    try {
      await navigator.clipboard.writeText(defaultPassword)
      setIsPasswordCopied(true)
      if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current)
      copiedResetTimerRef.current = setTimeout(() => setIsPasswordCopied(false), 2000)
    } catch {
      toast.error("Gagal menyalin password. Salin secara manual.")
    }
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
                Akun <span className="font-semibold text-foreground">{values.username}</span> berhasil dibuat.
              </p>
              <p className="text-sm text-muted-foreground">Bagikan password default berikut kepada staff:</p>
            </div>
            <div className="w-full flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
              <span className="flex-1 font-mono font-semibold text-foreground tracking-widest">{defaultPassword}</span>
              <button onClick={handleCopyPassword} className="text-muted-foreground hover:text-foreground transition-colors" title="Salin password">
                <CopyIcon className="size-4" />
              </button>
            </div>
            {isPasswordCopied && <p className="text-xs text-primary -mt-2">Password disalin!</p>}
            <p className="text-xs text-muted-foreground">Staff dapat mengganti password setelah login pertama kali.</p>
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
          <StaffFormFields values={values} errors={errors} onFieldChange={handleFieldChange} />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-secondary text-primary hover:bg-secondary/90 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <UserPlusIcon className="size-4" />}
              {isSubmitting ? "Menambahkan..." : "Tambah Staff"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
