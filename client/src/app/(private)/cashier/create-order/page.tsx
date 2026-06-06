"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { menuService } from "@/services/menu.service"
import { orderService } from "@/services/order.service"
import { tableService } from "@/services/table.service"
import type { Menu } from "@/types/menu"
import { MenuStatus, MenuType } from "@/types/menu"
import type { Table } from "@/types/table"
import { Loader2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react"

type CartItem = {
  menu: Menu
  quantity: number
}

const CATEGORIES = [
  { label: "Semua", value: null },
  { label: "Makanan", value: MenuType.FOOD },
  { label: "Minuman Panas", value: MenuType.HOT_DRINK },
  { label: "Minuman Dingin", value: MenuType.COLD_DRINK },
  { label: "Snack", value: MenuType.SNACK },
]

const TAX_RATE = 0.1

const formatCurrency = (value: number) =>
  `Rp ${Number(value).toLocaleString("id-ID")}`

export default function CashierCreateOrderPage() {
  const router = useRouter()

  const [tables, setTables] = useState<Table[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m] = await Promise.all([tableService.getAll(), menuService.getAll()])
        setTables(t)
        setMenus(m)
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [])

  const addToCart = (menu: Menu) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu.id === menu.id)
      if (existing) {
        return prev.map((i) => i.menu.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { menu, quantity: 1 }]
    })
  }

  const changeQty = (menuId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.menu.id === menuId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (menuId: number) => {
    setCart((prev) => prev.filter((i) => i.menu.id !== menuId))
  }

  const getQty = (menuId: number) => cart.find((i) => i.menu.id === menuId)?.quantity ?? 0

  const subtotal = cart.reduce((sum, i) => sum + Number(i.menu.price) * i.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const filteredMenus = menus.filter((m) => {
    if (m.status !== MenuStatus.AVAILABLE) return false
    if (activeCategory !== null && m.type !== activeCategory) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSubmit = async () => {
    if (!selectedTableId || cart.length === 0) return
    setSubmitting(true)
    try {
      await orderService.create({
        table_id: parseInt(selectedTableId),
        customer_name: customerName.trim() || undefined,
        items: cart.map((i) => ({ menu_id: i.menu.id, quantity: i.quantity })),
      })
      router.push("/cashier/order")
    } catch (error) {
      console.error("Gagal membuat pesanan:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full p-4 lg:p-6">

      {/* ── Left panel: cart & table ── */}
      <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4">

        {/* Table selector */}
        <div className="bg-white border border-foreground/10 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Pilih Meja</p>
          <Select value={selectedTableId} onValueChange={setSelectedTableId}>
            <SelectTrigger>
              <SelectValue placeholder="— Pilih nomor meja —" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  Meja {String(t.number).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold">
              Nama Pelanggan <span className="font-normal text-muted-foreground">(opsional)</span>
            </p>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama pelanggan"
              maxLength={100}
            />
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white border border-foreground/10 rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Pesanan</p>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-destructive hover:underline"
              >
                Hapus semua
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <ShoppingCart className="size-10 opacity-30" />
              <p className="text-sm">Belum ada item</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64 lg:max-h-none lg:flex-1">
              {cart.map((item) => (
                <div key={item.menu.id} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.menu.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.menu.price)} / item
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => changeQty(item.menu.id, -1)}
                      className="size-6 rounded border border-foreground/20 flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center tabular-nums font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.menu.id, 1)}
                      className="size-6 rounded border border-foreground/20 flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.menu.id)}
                      className="size-6 rounded flex items-center justify-center text-destructive/60 hover:text-destructive ml-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              <hr className="border-foreground/10 mt-auto" />
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>PPN (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedTableId || cart.length === 0 || submitting}
          className="w-full bg-secondary text-primary font-semibold py-5"
        >
          {submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Buat Pesanan
        </Button>

      </aside>

      {/* ── Right panel: menu browsing ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={String(cat.value)}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.value
                  ? "bg-primary text-white border-primary"
                  : "border-foreground/20 text-foreground hover:border-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        {filteredMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <p className="text-sm">Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
            {filteredMenus.map((menu) => {
              const qty = getQty(menu.id)
              return (
                <div
                  key={menu.id}
                  className="bg-white border border-foreground/10 rounded-xl overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] bg-muted">
                    <Image
                      src={menu.image_url ?? "/image/menu/nasi-goreng.jpg"}
                      alt={menu.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{menu.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{menu.type_name}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(menu.price)}</p>

                    {/* Add / qty control */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(menu)}
                        className="w-full text-xs font-semibold py-1.5 rounded-lg bg-secondary text-primary hover:bg-secondary/90 transition-colors"
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => changeQty(menu.id, -1)}
                          className="size-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="text-sm font-bold tabular-nums flex-1 text-center">{qty}</span>
                        <button
                          onClick={() => changeQty(menu.id, 1)}
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
