"use client"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { PageLoader } from "@/components/shared/page-state"
import { useCart } from "@/hooks/use-cart"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { MenuType } from "@/types/menu"
import { CoffeeIcon } from "@/components/icons/coffee"
import { CookieIcon } from "@/components/icons/cookie"
import { DashboardIcon } from "@/components/icons/dashboard"
import { DishIcon } from "@/components/icons/dish"
import { DrinkIcon } from "@/components/icons/drink"
import { useCallback, useEffect, useState } from "react"
import { MenuCard } from "./menu-card"

type MenuCategory = {
  id: string
  label: string
  menuType: MenuType | null
  Icon: React.ComponentType<{ className?: string }>
}

const MENU_CATEGORIES: MenuCategory[] = [
  { id: "all", label: "Semua menu", menuType: null, Icon: DashboardIcon },
  { id: "food", label: "Makanan", menuType: MenuType.FOOD, Icon: DishIcon },
  { id: "hot-drink", label: "Minuman Hangat", menuType: MenuType.HOT_DRINK, Icon: CoffeeIcon },
  { id: "cold-drink", label: "Minuman Dingin", menuType: MenuType.COLD_DRINK, Icon: DrinkIcon },
  { id: "snack", label: "Cemilan", menuType: MenuType.SNACK, Icon: CookieIcon },
]

const filterMenusByCategory = (menus: Menu[], category: MenuCategory) =>
  category.menuType === null ? menus : menus.filter((menu) => menu.type === category.menuType)

function MenuGrid({ menus }: { menus: Menu[] }) {
  const { addToCart, setCartQuantity, getCartQuantity } = useCart()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-background z-20">
      {menus.map((menu) => {
        const quantity = getCartQuantity(menu.id)
        return (
          <MenuCard
            key={menu.id}
            menu={menu}
            quantity={quantity}
            onAdd={() => addToCart(menu)}
            onIncrease={() => setCartQuantity(menu.id, quantity + 1)}
            onDecrease={() => setCartQuantity(menu.id, quantity - 1)}
          />
        )
      })}
    </div>
  )
}

export function MenuCatalog({ search }: { search: string }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(MENU_CATEGORIES[0].id)
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchMenus = useCallback(async (searchTerm: string) => {
    const isLatest = startRequest()
    setIsLoading(true)
    try {
      const data = await menuService.getAll({ q: searchTerm.trim() || undefined })
      if (isLatest()) setMenus(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest()) setMenus([])
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchMenus(debouncedSearch)
  }, [fetchMenus, debouncedSearch])

  if (isLoading) return <PageLoader />

  return (
    <div className="flex w-full h-max flex-col gap-6 overflow-y-auto scrollbar-hide scroll-smooth">
      <Tabs value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
        <div className="w-full overflow-x-auto scrollbar-hide scroll-smooth">
          <TabsList className="w-max py-2 mx-4 gap-2">
            {MENU_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="bg-primary-foreground data-[state=active]:bg-primary/10 w-[180px] data-[state=active]:border-2 data-[state=active]:border-primary rounded-xl flex flex-col items-start gap-6 p-4 transition-colors duration-500 group"
              >
                <div className="bg-background group-data-[state=active]:bg-primary rounded-full p-2">
                  <category.Icon className="size-6 text-foreground group-data-[state=active]:text-primary-foreground" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-base text-foreground group-data-[state=active]:text-primary font-semibold">
                    {category.label}
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {filterMenusByCategory(menus, category).length} menu
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContents>
          {MENU_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="px-4">
              <MenuGrid menus={filterMenusByCategory(menus, category)} />
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>

      <span className="text-xs text-foreground/80 mt-12 mb-6 text-center">
        © {new Date().getFullYear()} Cat-a Log All rights reserved.
      </span>
    </div>
  )
}
