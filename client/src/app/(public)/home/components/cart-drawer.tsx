"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useCart from "@/hooks/use-cart";
import { CartIcon } from "@icons/cart";
import { MinusIcon } from "@icons/minus";
import { NoteIcon } from "@icons/note";
import { PlusIcon } from "@icons/plus";
import Image from "next/image";
import Link from "next/link";

const CartDrawer = () => {
  const {
    cartItems,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart
  } = useCart()

  const subtotal = getTotalPrice()
  const taxRate = 0.10
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="relative">
          <CartIcon className="size-6 text-primary" />
          {getTotalItems() > 0 && (
            <Badge
              variant="default"
              className="absolute -top-6 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs border-0 bg-primary text-primary-foreground"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="flex justify-between items-center">
              <span>Pesanan Anda</span>
              {cartItems.length > 0 && (
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
            {cartItems.length === 0 ? (
              <div className="text-center text-muted-foreground min-h-40">
                <CartIcon className="size-12 mx-auto mb-4 opacity-50" />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-60">
                {cartItems.map((item) => (
                  <div key={item.menu.id} className="flex flex-col gap-2 bg-background border rounded-lg p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="shrink-0">
                        <Image
                          src={item.menu.image}
                          alt={item.menu.name}
                          width={100}
                          height={100}
                          className="size-16 object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.menu.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0
                          }).format(item.menu.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-background p-1 rounded-full">
                        <Button
                          variant="default"
                          size="icon"
                          className="size-6 bg-white rounded-full"
                          onClick={() => updateQuantity(item.menu.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-3" />
                        </Button>

                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>

                        <Button
                          variant="default"
                          size="icon"
                          className="size-6 bg-white rounded-full"
                          onClick={() => updateQuantity(item.menu.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                    {/* Note */}
                    <div className="flex items-center gap-1 bg-primary-foreground border-2 border-primary rounded-lg p-2">
                      <NoteIcon className="size-5 text-foreground" />
                      <Input
                        className="text-xs font-medium"
                        placeholder="Tambahkan note untuk pesanan ini"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="px-2 space-y-3">
              <Separator className="my-4" />
              <div className="flex flex-col justify-center gap-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>PPN (10%):</span>
                  <span>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0
                    }).format(taxAmount)}
                  </span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(total)}
                </span>
              </div>

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

export default CartDrawer