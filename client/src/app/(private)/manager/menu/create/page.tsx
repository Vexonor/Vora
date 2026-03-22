"use client"

import { CreateMenuForm, MenuForm } from "@/components/[role]/manager/menu/create-menu-form"
import { useRouter } from "next/navigation"

export default function ManagerCreateMenuPage() {
  const router = useRouter()

  const handleSubmit = (form: MenuForm) => {
    // TODO: API call
    router.push("/manager/menu")
  }

  return <CreateMenuForm onSubmit={handleSubmit} />
}