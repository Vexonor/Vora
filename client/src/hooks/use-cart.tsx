"use client"

import type { Menu } from "@/types/menu"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

const CART_STORAGE_KEY = "cart"

export type CartItem = {
  menu: Menu
  quantity: number
}

type CartContextValue = {
  cartItems: CartItem[]
  totalQuantity: number
  subtotal: number
  addToCart: (menu: Menu) => void
  setCartQuantity: (menuId: number, quantity: number) => void
  clearCart: () => void
  getCartQuantity: (menuId: number) => number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function isValidCartItem(value: unknown): value is CartItem {
  const item = value as CartItem
  return typeof item?.menu?.id === "number" && typeof item.quantity === "number" && item.quantity > 0
}

function readStoredCart(): CartItem[] {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY)
  if (!storedCart) return []
  const parsedCart: unknown = JSON.parse(storedCart)
  return Array.isArray(parsedCart) ? parsedCart.filter(isValidCartItem) : []
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isRestored, setIsRestored] = useState(false)

  useEffect(() => {
    try {
      setCartItems(readStoredCart())
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    } finally {
      setIsRestored(true)
    }
  }, [])

  useEffect(() => {
    if (!isRestored) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems, isRestored])

  const addToCart = (menu: Menu) => {
    setCartItems((previous) => {
      const isAlreadyInCart = previous.some((item) => item.menu.id === menu.id)
      if (isAlreadyInCart) {
        return previous.map((item) => item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...previous, { menu, quantity: 1 }]
    })
  }

  const setCartQuantity = (menuId: number, quantity: number) => {
    setCartItems((previous) =>
      quantity <= 0
        ? previous.filter((item) => item.menu.id !== menuId)
        : previous.map((item) => item.menu.id === menuId ? { ...item, quantity } : item)
    )
  }

  const clearCart = () => setCartItems([])

  const getCartQuantity = (menuId: number) =>
    cartItems.find((item) => item.menu.id === menuId)?.quantity ?? 0

  const value: CartContextValue = {
    cartItems,
    totalQuantity: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce((total, item) => total + Number(item.menu.price) * item.quantity, 0),
    addToCart,
    setCartQuantity,
    clearCart,
    getCartQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
