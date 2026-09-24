"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatRupiah } from "@/lib/format"
import { MENU_IMAGE_PLACEHOLDER } from "@/lib/menu-status"
import { formatTableName } from "@/lib/order-place"
import { addTaxToSubtotal, TAX_RATE } from "@/lib/pricing"
import { menuService } from "@/services/menu.service"
import { orderService } from "@/services/order.service"
import { tableService } from "@/services/table.service"
import type { Menu } from "@/types/menu"
import { MenuStatus, MenuType } from "@/types/menu"
import { OrderType } from "@/types/order"
import type { Table } from "@/types/table"
import { Loader2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type CartItem = {
  menu: Menu
  quantity: number
}

const MENU_CATEGORY_TABS = [
  { label: "Semua", menuType: null },
  { label: "Makanan", menuType: MenuType.FOOD },
  { label: "Minuman Panas", menuType: MenuType.HOT_DRINK },
  { label: "Minuman Dingin", menuType: MenuType.COLD_DRINK },
  { label: "Snack", menuType: MenuType.SNACK },
]

const ORDER_TYPE_OPTIONS = [
  { value: OrderType.DINE_IN, label: "Dine In" },
  { value: OrderType.TAKE_AWAY, label: "Take Away" },
]

export default function CashierCreateOrderPage() {
  const router = useRouter()

  const [tables, setTables] = useState<Table[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedTableId, setSelectedTableId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [activeMenuType, setActiveMenuType] = useState<MenuType | null>(null)
  const [search, setSearch] = useState("")
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN)
  const [formError, setFormError] = useState<string | null>(null)

  const isTakeAway = orderType === OrderType.TAKE_AWAY

  useEffect(() => {
    const fetchTablesAndMenus = async () => {
      try {
        const [tableList, menuList] = await Promise.all([tableService.getAll(), menuService.getAll()])
        setTables(tableList)
        setMenus(menuList)
      } catch {
        toast.error("Gagal memuat data meja dan menu. Muat ulang halaman.")
      } finally {
        setIsPageLoading(false)
      }
    }
    fetchTablesAndMenus()
  }, [])

  const addToCart = (menu: Menu) => {
    setCartItems((previous) => {
      const isAlreadyInCart = previous.some((item) => item.menu.id === menu.id)
      if (isAlreadyInCart) {
        return previous.map((item) => item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...previous, { menu, quantity: 1 }]
    })
  }

  const changeCartQuantity = (menuId: number, quantityDelta: number) => {
    setCartItems((previous) =>
      previous
        .map((item) => item.menu.id === menuId ? { ...item, quantity: item.quantity + quantityDelta } : item)
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (menuId: number) => {
    setCartItems((previous) => previous.filter((item) => item.menu.id !== menuId))
  }

  const getCartQuantity = (menuId: number) => cartItems.find((item) => item.menu.id === menuId)?.quantity ?? 0

  const cartSubtotal = cartItems.reduce((total, item) => total + Number(item.menu.price) * item.quantity, 0)
  const { subtotal, tax, total } = addTaxToSubtotal(cartSubtotal)

  const normalizedSearch = search.trim().toLowerCase()
  const visibleMenus = menus.filter((menu) => {
    if (menu.status !== MenuStatus.AVAILABLE) return false
    if (activeMenuType !== null && menu.type !== activeMenuType) return false
    return menu.name.toLowerCase().includes(normalizedSearch)
  })

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setFormError("Tambahkan minimal satu item pesanan.")
      return
    }
    if (!isTakeAway && !selectedTableId) {
      setFormError("Pilih nomor meja untuk pesanan Dine In.")
      return
    }
    if (isTakeAway && !customerName.trim()) {
      setFormError("Nama pelanggan wajib diisi untuk pesanan Take Away.")
      return
    }

    setFormError(null)
    setIsSubmitting(true)
    try {
      await orderService.create({
        order_type: orderType,
        table_id: isTakeAway ? undefined : parseInt(selectedTableId, 10),
        customer_name: customerName.trim() || undefined,
        items: cartItems.map((item) => ({ menu_id: item.menu.id, quantity: item.quantity })),
      })
      router.push("/cashier/order")
    } catch {
      setFormError("Gagal membuat pesanan. Periksa koneksi lalu coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 lg:h-[calc(100svh-5rem)] lg:overflow-hidden">

      <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4 lg:h-full lg:min-h-0">

        <div className="bg-white border border-foreground/10 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Tipe Pesanan</p>
          <div className="grid grid-cols-2 gap-2">
            {ORDER_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setOrderType(option.value)
                  setFormError(null)
                }}
                className={`text-sm font-semibold rounded-lg py-2 border transition-colors ${
                  orderType === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/15 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {!isTakeAway && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold">Pilih Meja</p>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="— Pilih nomor meja —" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={String(table.id)}>
                      {formatTableName(table.number)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold">
              Nama Pelanggan{" "}
              <span className="font-normal text-muted-foreground">
                {isTakeAway ? "(wajib)" : "(opsional)"}
              </span>
            </p>
            <Input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Masukkan nama pelanggan"
              maxLength={100}
            />
          </div>

          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}
        </div>

        <div className="bg-white border border-foreground/10 rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Pesanan</p>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-xs text-destructive hover:underline"
              >
                Hapus semua
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <ShoppingCart className="size-10 opacity-30" />
              <p className="text-sm">Belum ada item</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64 lg:max-h-none lg:flex-1">
              {cartItems.map((item) => (
                <div key={item.menu.id} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.menu.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRupiah(item.menu.price)} / item
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => changeCartQuantity(item.menu.id, -1)}
                      className="size-6 rounded border border-foreground/20 flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center tabular-nums font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => changeCartQuantity(item.menu.id, 1)}
                      className="size-6 rounded border border-foreground/20 flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.menu.id)}
                      className="size-6 rounded flex items-center justify-center text-destructive/60 hover:text-destructive ml-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              <hr className="border-foreground/10 mt-auto" />
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>PPN ({TAX_RATE * 100}%)</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-secondary text-primary font-semibold py-5 shrink-0"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
          Buat Pesanan
        </Button>

      </aside>

      <div className="flex-1 flex flex-col gap-4 min-w-0 lg:h-full lg:min-h-0">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari menu..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MENU_CATEGORY_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveMenuType(tab.menuType)}
              className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
                activeMenuType === tab.menuType
                  ? "bg-primary text-white border-primary"
                  : "border-foreground/20 text-foreground hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visibleMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <p className="text-sm">Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 overflow-y-auto flex-1 min-h-0 content-start auto-rows-max">
            {visibleMenus.map((menu) => {
              const cartQuantity = getCartQuantity(menu.id)
              return (
                <div
                  key={menu.id}
                  className="bg-white border border-foreground/10 rounded-xl flex flex-col self-start"
                >
                  <div className="relative w-full h-32 sm:h-36 bg-muted shrink-0 overflow-hidden rounded-t-xl">
                    <Image
                      src={menu.image_url ?? MENU_IMAGE_PLACEHOLDER}
                      alt={menu.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-3 flex flex-col gap-2 flex-1 shrink-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{menu.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{menu.type_name}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatRupiah(menu.price)}</p>

                    {cartQuantity === 0 ? (
                      <button
                        onClick={() => addToCart(menu)}
                        className="w-full text-xs font-semibold py-1.5 rounded-lg bg-secondary text-primary hover:bg-secondary/90 transition-colors"
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => changeCartQuantity(menu.id, -1)}
                          className="size-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="text-sm font-bold tabular-nums flex-1 text-center">{cartQuantity}</span>
                        <button
                          onClick={() => changeCartQuantity(menu.id, 1)}
                          className="size-7 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-secondary/90"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
