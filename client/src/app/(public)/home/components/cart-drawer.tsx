"use client"

import { CartItemRow } from "@/components/customer/cart-item-row"
import { CartPriceSummary } from "@/components/customer/cart-price-summary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { CartIcon } from "@icons/cart"
import Link from "next/link"

export function CartDrawer() {
  const { cartItems, totalQuantity, subtotal, clearCart } = useCart()
  const hasItems = cartItems.length > 0

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="relative" aria-label="Buka keranjang">
          <CartIcon className="size-6 text-primary" />
          {totalQuantity > 0 && (
            <Badge
              variant="default"
              className="absolute -top-6 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs border-0 bg-primary text-primary-foreground"
            >
              {totalQuantity}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="flex justify-between items-center">
              <span>Pesanan Anda</span>
              {hasItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Kosongkan
                </Button>
              )}
            </DrawerTitle>
            <Separator />
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-2">
            {hasItems ? (
              <div className="space-y-1 max-h-60">
                {cartItems.map((item) => (
                  <CartItemRow key={item.menu.id} item={item} className="bg-background" />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground min-h-40">
                <CartIcon className="size-12 mx-auto mb-4 opacity-50" />
                <p>Keranjang masih kosong</p>
              </div>
            )}
          </div>
          {hasItems && (
            <div className="px-2 space-y-3">
              <Separator className="my-4" />
              <CartPriceSummary subtotal={subtotal} />
              <DrawerFooter className="px-0 gap-2 mb-8">
                <Link href="/payment" className="bg-secondary text-primary font-semibold rounded-lg p-2 text-center">
                  Pesan Sekarang
                </Link>
              </DrawerFooter>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
