"use client"

import { saveCustomerTableId } from "@/lib/customer-table"
import { useEffect, useState } from "react"
import { CartDrawer } from "./components/cart-drawer"
import { HomeHeader } from "./components/home-header"
import { MenuCatalog } from "./components/menu-catalog"

export default function CustomerHomePage() {
  const [search, setSearch] = useState("")

  useEffect(() => {
    const scannedTableId = new URLSearchParams(window.location.search).get("table")
    if (scannedTableId) saveCustomerTableId(scannedTableId)
  }, [])

  return (
    <main className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto bg-background flex flex-col gap-2 relative">
        <HomeHeader search={search} onSearchChange={setSearch} />
        <MenuCatalog search={search} />

        <div className="absolute bottom-4 right-4 bg-secondary size-20 flex justify-center items-center rounded-full z-30">
          <CartDrawer />
        </div>
      </div>
    </main>
  )
}
