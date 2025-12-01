// providers/CartProvider.tsx
"use client"

import useCart, { CartItem } from "@/hooks/use-cart"
import { Menu } from "@/lib/type/menu"
import { createContext, ReactNode, useContext } from "react"

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (menu: Menu) => void
  removeFromCart: (menuId: number) => void
  updateQuantity: (menuId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getCartQuantity: (menuId: number) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart()

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export const useCartContext = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider")
  }
  return context
}