export type StaffRole = "manager" | "kitchen" | "cashier"
export type StaffStatus = "aktif" | "nonaktif"

export type Staff = {
  id: string
  username: string
  email: string
  role: StaffRole
  status: StaffStatus
}

export const STAFF_ROLE_CONFIG: Record<StaffRole, {
  label: string
  badgeClass: string
}> = {
  manager: {
    label: "Manager",
    badgeClass: "border border-verified text-verified bg-verified/10",
  },
  kitchen: {
    label: "Kitchen",
    badgeClass: "border border-secondary text-secondary bg-secondary/10",
  },
  cashier: {
    label: "Kasir",
    badgeClass: "border border-primary text-primary bg-primary/10",
  },
}

export const STAFF_ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: "Manager", value: "manager" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Kasir", value: "cashier" },
]

export const STAFFS: Staff[] = [
  { id: "1", username: "admin_manager", email: "manager@vora.com", role: "manager", status: "aktif" },
  { id: "2", username: "chef_utama", email: "kitchen@vora.com", role: "kitchen", status: "aktif" },
  { id: "3", username: "kasir_utama", email: "cashier@vora.com", role: "cashier", status: "aktif" },
  { id: "4", username: "chef_2", email: "kitchen2@vora.com", role: "kitchen", status: "nonaktif" },
  { id: "5", username: "kasir_2", email: "cashier2@vora.com", role: "cashier", status: "aktif" },
]