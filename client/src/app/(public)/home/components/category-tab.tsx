"use client"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import useCart from "@/hooks/use-cart"
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
import { MenuType } from "@/types/menu"
import { CoffeeIcon } from "@icons/coffee"
import { CookieIcon } from "@icons/cookie"
import { DashboardIcon } from "@icons/dashboard"
import { DishIcon } from "@icons/dish"
import { DrinkIcon } from "@icons/drink"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import CardMenu from "./card-menu"

type CategoryDef = {
  id: string
  label: string
  typeValue?: number // maps to MenuType enum
  Icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryDef[] = [
  { id: "all", label: "Semua menu", Icon: DashboardIcon },
  { id: "food", label: "Makanan", typeValue: MenuType.FOOD, Icon: DishIcon },
  { id: "hot-drink", label: "Minuman Hangat", typeValue: MenuType.HOT_DRINK, Icon: CoffeeIcon },
  { id: "cold-drink", label: "Minuman Dingin", typeValue: MenuType.COLD_DRINK, Icon: DrinkIcon },
  { id: "snack", label: "Cemilan", typeValue: MenuType.SNACK, Icon: CookieIcon },
]

/** Adapt API Menu to the shape expected by CardMenu (uses old `Menu` interface from lib/type) */
const adaptMenu = (m: Menu) => ({
  id: m.id,
  name: m.name,
  category: "",
  price: Number(m.price),
  description: m.description ?? "",
  image: m.image_url ?? "/image/menu/nasi-goreng.jpg",
  isAvailable: m.status === 1,
})

const CategoryTabsList = ({ categories, menusByCategory }: { categories: CategoryDef[]; menusByCategory: Record<string, number> }) => (
  <div className="w-full overflow-x-auto scrollbar-hide scroll-smooth">
    <TabsList className="w-max py-2 mx-4 gap-2">
      {categories.map((category) => (
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
              {menusByCategory[category.id] ?? 0} menu
            </span>
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  </div>
)

const MenuGrid = ({ menus }: { menus: ReturnType<typeof adaptMenu>[] }) => {
  const { addToCart, updateQuantity, getCartQuantity } = useCart()

  const handleAddToCart = (menu: ReturnType<typeof adaptMenu>) => (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(menu as never)
  }

  const handleIncreaseQuantity = (menu: ReturnType<typeof adaptMenu>) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentQuantity = getCartQuantity(menu.id)
    updateQuantity(menu.id, currentQuantity + 1)
  }

  const handleDecreaseQuantity = (menu: ReturnType<typeof adaptMenu>) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentQuantity = getCartQuantity(menu.id)
    if (currentQuantity === 1) {
      updateQuantity(menu.id, 0)
    } else {
      updateQuantity(menu.id, currentQuantity - 1)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-background z-20">
      {menus.map((menuItem) => {
        const quantity = getCartQuantity(menuItem.id)

        return (
          <CardMenu
            key={menuItem.id}
            menu={menuItem}
            quantity={quantity}
            onAdd={handleAddToCart(menuItem)}
            onIncrease={handleIncreaseQuantity(menuItem)}
            onDecrease={handleDecreaseQuantity(menuItem)}
          />
        )
      })}
    </div>
  )
}

const CategoryTab = ({ search = "" }: { search?: string }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [apiMenus, setApiMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMenus = useCallback(async (q: string) => {
    setIsLoading(true)
    try {
      const data = await menuService.getAll({ q: q.trim() || undefined })
      setApiMenus(Array.isArray(data) ? data : [])
    } catch {
      setApiMenus([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce search so we hit the endpoint's `q` param, not filter client-side
  useEffect(() => {
    const handler = setTimeout(() => fetchMenus(search), 400)
    return () => clearTimeout(handler)
  }, [search, fetchMenus])

  const menusByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: apiMenus.length }
    for (const cat of CATEGORIES) {
      if (cat.typeValue !== undefined) {
        counts[cat.id] = apiMenus.filter((m) => m.type === cat.typeValue).length
      }
    }
    return counts
  }, [apiMenus])

  const getMenusByCategory = useCallback(
    (categoryId: string) => {
      const cat = CATEGORIES.find((c) => c.id === categoryId)
      const filtered =
        categoryId === "all" || !cat?.typeValue
          ? apiMenus
          : apiMenus.filter((m) => m.type === cat.typeValue)
      return filtered.map(adaptMenu)
    },
    [apiMenus],
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex w-full h-max flex-col gap-6 overflow-y-auto scrollbar-hide scroll-smooth">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <CategoryTabsList categories={CATEGORIES} menusByCategory={menusByCategory} />

        <TabsContents>
          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="px-4">
              <MenuGrid menus={getMenusByCategory(category.id)} />
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>

      <span className="text-xs text-foreground/80 mt-12 mb-6 text-center">
        © {new Date().getFullYear()} Vora All rights reserved.
      </span>
    </div>
  )
}

export default CategoryTab