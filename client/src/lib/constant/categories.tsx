import { MenuCategory } from "../type/menu-category";

export const categories: MenuCategory[] = [
  {
    id: "all",
    label: "Semua menu",
    count: 35,
    icon: "DashboardIcon",
  },
  {
    id: "food",
    label: "Makanan",
    count: 20,
    icon: "DishIcon",
  },
  {
    id: "hot-drink",
    label: "Minuman Hangat",
    count: 15,
    icon: "CoffeeIcon",
  },
  {
    id: "cold-drink",
    label: "Minuman Dingin",
    count: 15,
    icon: "DrinkIcon",
  },
  {
    id: "snack",
    label: "Cemilan",
    count: 15,
    icon: "CookieIcon",
  },
];