import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { USER_ROLE_OPTIONS } from "@/lib/user-role"

export type StaffFormValues = {
  username: string
  email: string
  role: string
}

export type StaffFormErrors = Partial<Record<keyof StaffFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateStaffForm(values: StaffFormValues): StaffFormErrors {
  const errors: StaffFormErrors = {}
  if (!values.username.trim()) errors.username = "Username tidak boleh kosong."
  if (!values.email.trim()) errors.email = "Email tidak boleh kosong."
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Format email tidak valid."
  if (!values.role) errors.role = "Pilih role terlebih dahulu."
  return errors
}

type Props = {
  values: StaffFormValues
  errors: StaffFormErrors
  onFieldChange: (field: keyof StaffFormValues, value: string) => void
}

export function StaffFormFields({ values, errors, onFieldChange }: Props) {
  return (
    <>
      <FormField label="Username" error={errors.username}>
        <Input
          autoFocus
          placeholder="Masukkan username"
          value={values.username}
          onChange={(event) => onFieldChange("username", event.target.value)}
          aria-invalid={!!errors.username}
        />
      </FormField>
      <FormField label="Email" error={errors.email}>
        <Input
          type="email"
          placeholder="Masukkan email"
          value={values.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          aria-invalid={!!errors.email}
        />
      </FormField>
      <FormField label="Role" error={errors.role}>
        <Select value={values.role} onValueChange={(role) => onFieldChange("role", role)}>
          <SelectTrigger aria-invalid={!!errors.role}>
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </>
  )
}
