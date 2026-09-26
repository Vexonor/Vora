"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUpdateStaff } from "@/hooks/queries/use-staff"
import { getApiErrorMessage } from "@/lib/api-error"
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

export function EditStaffModal({ staff, onClose }: { staff: User; onClose: () => void }) {
  const [values, setValues] = useState<StaffFormValues>({
    username: staff.username,
    email: staff.email,
    role: String(staff.role),
  })
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const updateStaff = useUpdateStaff()

  const handleFieldChange = (field: keyof StaffFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const handleSubmit = () => {
    const validationErrors = validateStaffForm(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    updateStaff.mutate(
      {
        staffId: staff.id,
        request: { username: values.username.trim(), email: values.email.trim(), role: Number(values.role) },
      },
      {
        onSuccess: () => {
          toast.success("Data staff berhasil diperbarui.")
          onClose()
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal memperbarui staff. Coba lagi.")),
      },
    )
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
            <Button variant="outline" onClick={onClose} disabled={updateStaff.isPending}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={updateStaff.isPending}
              className="bg-secondary text-white hover:bg-secondary/90 flex items-center gap-2"
            >
              {updateStaff.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {updateStaff.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
