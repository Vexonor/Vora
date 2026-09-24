"use client"

import { CartItemRow } from "@/components/customer/cart-item-row"
import { useCart } from "@/hooks/use-cart"

export function CartReviewSection() {
  const { cartItems } = useCart()

  return (
    <div>
      <h3 className="text-base text-foreground font-bold pb-2">Pesanan Anda</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {cartItems.map((item) => (
          <CartItemRow key={item.menu.id} item={item} className="bg-white border-foreground/20" />
        ))}
      </div>
    </div>
  )
}
