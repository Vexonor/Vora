import type { Menu } from "@/types/menu"

export type MenuFormValues = {
  name: string
  price: string
  cost: string
  description: string
  type: string
  status: string
  image: File | null
}

export function toMenuFormValues(menu?: Menu): MenuFormValues {
  if (!menu) return { name: "", price: "", cost: "", description: "", type: "", status: "", image: null }
  return {
    name: menu.name,
    price: String(Number(menu.price)),
    cost: menu.cost != null ? String(Number(menu.cost)) : "",
    description: menu.description ?? "",
    type: String(menu.type),
    status: String(menu.status),
    image: null,
  }
}

export function toMenuFormData(values: MenuFormValues, { includeStatus }: { includeStatus: boolean }) {
  const formData = new FormData()
  formData.append("name", values.name)
  formData.append("price", values.price)
  formData.append("cost", values.cost || "0")
  formData.append("type", values.type)
  if (includeStatus && values.status !== "") formData.append("status", values.status)
  if (values.description) formData.append("description", values.description)
  if (values.image) formData.append("image", values.image)
  return formData
}
