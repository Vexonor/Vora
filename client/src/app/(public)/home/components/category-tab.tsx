"use client"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import useCart from "@/hooks/use-cart"
import { categories } from "@/lib/constant/categories"
import { MENUS, MenuCategory as MenuCategoryValue } from "@/lib/constant/menu"
import { Menu } from "@/lib/type/menu"
import { MenuCategory } from "@/lib/type/menu-category"
import { CoffeeIcon } from "@icons/coffee"
import { CookieIcon } from "@icons/cookie"
import { DashboardIcon } from "@icons/dashboard"
import { DishIcon } from "@icons/dish"
import { DrinkIcon } from "@icons/drink"
import { useState } from "react"
import CardMenu from "./card-menu"

const ICON_MAP = {
  DashboardIcon,
  DishIcon,
  CoffeeIcon,
  DrinkIcon,
  CookieIcon,
} as const

interface CategoryWithIcon extends MenuCategory {
  Icon: React.ComponentType<{ className?: string }>
}

const CategoryTabsList = ({
  categoriesWithIcons,
}: {
  categoriesWithIcons: CategoryWithIcon[]
}) => (
  <div className="w-full overflow-x-auto scrollbar-hide scroll-smooth">
    <TabsList className="w-max py-2 mx-4 gap-2">
      {categoriesWithIcons.map((category) => (
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
              {category.count} menu
            </span>
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  </div>
)

const MenuGrid = ({ menus }: { menus: Menu[] }) => {
  const { addToCart, updateQuantity, getCartQuantity } = useCart()

  const handleAddToCart = (menu: Menu) => (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(menu)
  }

  const handleIncreaseQuantity = (menu: Menu) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentQuantity = getCartQuantity(menu.id)
    updateQuantity(menu.id, currentQuantity + 1)
  }

  const handleDecreaseQuantity = (menu: Menu) => (e: React.MouseEvent) => {
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

const CategoryTab = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categoriesWithIcons: CategoryWithIcon[] = categories.map(category => ({
    ...category,
    Icon: ICON_MAP[category.icon as keyof typeof ICON_MAP] || DashboardIcon,
  }))

  const getMenusByCategory = (categoryId: string): Menu[] =>
    categoryId === "all"
      ? MENUS
      : MENUS.filter((m) => m.category === (categoryId as MenuCategoryValue))

  return (
    <div className="flex w-full h-max flex-col gap-6 overflow-y-auto scrollbar-hide scroll-smooth">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <CategoryTabsList categoriesWithIcons={categoriesWithIcons} />

        <TabsContents>
          {categoriesWithIcons.map((category) => (
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