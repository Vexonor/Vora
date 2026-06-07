// hooks/use-cart.ts
"use client"

import { Menu } from "@/lib/type/menu"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

const CART_STORAGE_KEY = "cart"

export interface CartItem {
  menu: Menu
  quantity: number
}

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

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Restore cart from localStorage so it survives a page refresh
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) setCartItems(JSON.parse(stored))
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    } finally {
      setHydrated(true)
    }
  }, [])

  // Persist cart on every change (only after the initial restore)
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems, hydrated])

  const addToCart = (menu: Menu) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.menu.id === menu.id)

      if (existingItem) {
        return prev.map(item =>
          item.menu.id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { menu, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (menuId: number) => {
    setCartItems(prev => prev.filter(item => item.menu.id !== menuId))
  }

  const updateQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId)
      return
    }

    setCartItems(prev =>
      prev.map(item =>
        item.menu.id === menuId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.menu.price * item.quantity), 0)
  }

  const getCartQuantity = (menuId: number) => {
    const item = cartItems.find(item => item.menu.id === menuId)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export default useCart