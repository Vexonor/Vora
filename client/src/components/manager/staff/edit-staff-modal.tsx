"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/lib/api-error"
import { userService } from "@/services/user.service"
import type { User } from "@/types/user"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  StaffFormFields,
  validateStaffForm,
  type StaffFormErrors,
  type StaffFormValues,
} from "./staff-form-fields"

type Props = {
  staff: User
  onSaved: () => void | Promise<void>
  onClose: () => void
}

export function EditStaffModal({ staff, onSaved, onClose }: Props) {
  const [values, setValues] = useState<StaffFormValues>({
    username: staff.username,
    email: staff.email,
    role: String(staff.role),
  })
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await userService.update(staff.id, {
        username: values.username.trim(),
        email: values.email.trim(),
        role: Number(values.role),
      })
      toast.success("Data staff berhasil diperbarui.")
      await onSaved()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal memperbarui staff. Coba lagi."))
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
          <StaffFormFields values={values} errors={errors} onFieldChange={handleFieldChange} />
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
