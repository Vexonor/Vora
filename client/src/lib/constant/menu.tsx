import { Menu } from "../type/menu"

export type MenuStatus = "tersedia" | "habis"

export type MenuCategory = "food" | "hot-drink" | "cold-drink" | "snack"

export const MENU_STATUS_CONFIG: Record<MenuStatus, {
  label: string
  badgeClass: string
}> = {
  tersedia: {
    label: "Tersedia",
    badgeClass: "border border-primary text-primary bg-primary/10",
  },
  habis: {
    label: "Habis",
    badgeClass: "border border-destructive text-destructive bg-destructive/10",
  },
}

export const MENU_CATEGORY_OPTIONS: { label: string; value: MenuCategory }[] = [
  { label: "Makanan", value: "food" },
  { label: "Minuman Panas", value: "hot-drink" },
  { label: "Minuman Dingin", value: "cold-drink" },
  { label: "Snack", value: "snack" },
]

export const getMenuStatus = (isAvailable: boolean): MenuStatus =>
  isAvailable ? "tersedia" : "habis"

export const MENUS: Menu[] = [
  {
    id: 1,
    name: "Nasi Goreng Spesial",
    category: "food",
    price: 25000,
    description: "Nasi goreng dengan telur, ayam, dan sayuran segar",
    image: "/image/menu/nasi-goreng.jpg",
    isAvailable: true,
    ingredients: ["nasi", "ayam", "telur", "wortel", "bawang", "kecap"],
  },
  {
    id: 2,
    name: "Mie Ayam Bakso",
    category: "food",
    price: 20000,
    description: "Mie ayam dengan bakso urat dan pangsit",
    image: "/images/mie-ayam.jpg",
    isAvailable: true,
    ingredients: ["mie", "ayam", "bakso", "pangsit", "sawi"],
  },
  {
    id: 3,
    name: "Kopi Tubruk",
    category: "hot-drink",
    price: 15000,
    description: "Kopi asli Indonesia dengan gula aren",
    image: "/images/kopi-tubruk.jpg",
    isAvailable: true,
    ingredients: ["kopi", "gula aren", "air panas"],
  },
  {
    id: 4,
    name: "Teh Tarik",
    category: "hot-drink",
    price: 18000,
    description: "Teh susu khas Malaysia yang disajikan hangat",
    image: "/images/teh-tarik.jpg",
    isAvailable: true,
    ingredients: ["teh", "susu", "gula"],
  },
  {
    id: 5,
    name: "Es Cendol",
    category: "cold-drink",
    price: 12000,
    description: "Minuman tradisional dengan cendol dan santan",
    image: "/images/es-cendol.jpg",
    isAvailable: true,
    ingredients: ["cendol", "santan", "gula merah", "es"],
  },
  {
    id: 6,
    name: "Es Jeruk",
    category: "cold-drink",
    price: 10000,
    description: "Jeruk segar dengan es dan mint",
    image: "/images/es-jeruk.jpg",
    isAvailable: true,
    ingredients: ["jeruk", "es", "mint", "gula"],
  },
  {
    id: 7,
    name: "Pisang Goreng",
    category: "snack",
    price: 8000,
    description: "Pisang goreng crispy dengan madu",
    image: "/images/pisang-goreng.jpg",
    isAvailable: true,
    ingredients: ["pisang", "tepung", "madu", "minyak"],
  },
]