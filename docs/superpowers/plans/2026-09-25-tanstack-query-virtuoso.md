# TanStack Query dan React Virtuoso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti pengambilan data manual di `client/` dengan TanStack Query, menambahkan infinite scroll pesanan dengan `VirtuosoGrid`, dan tabel berpagination dengan pilihan jumlah baris serta `TableVirtuoso`.

**Architecture:** TanStack Query duduk di atas `services/*` (axios) yang sudah ada. Setiap domain punya file hook di `hooks/queries/`, dan semua `queryKey` didefinisikan di `lib/query-keys.ts`. Daftar pesanan mengambil data lewat `orderService.getPage`, yang untuk sementara adalah adapter di atas `GET /orders` tanpa pagination. Logika murni (potong halaman, pencarian, cache, pagination tabel) dipisah ke `lib/` dan dites dengan Vitest.

**Tech Stack:** Next.js 16.3 (App Router, React Compiler), React 19, TypeScript, axios 1.20, `@tanstack/react-query` 5.103, `@tanstack/react-query-devtools` 5.103, `react-virtuoso` 4.18, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-09-25-tanstack-query-virtuoso-design.md`

## Global Constraints

- Semua path file relatif terhadap `client/` kecuali disebut lain. Semua perintah dijalankan dari `client/`.
- Tidak ada komentar penjelasan di source code. Hanya directive seperti `// eslint-disable-next-line` yang boleh.
- Folder vendor `src/components/ui/` dan `src/components/animate-ui/` tidak diubah.
- Gaya kode mengikuti file sekitarnya: named export, tanpa titik koma di komponen/hook, tanda kutip ganda.
- Ukuran halaman pesanan: `20`. Cache adapter pesanan: `5000` ms. Polling dapur: `10_000` ms. Polling status pelanggan: `8_000` ms. `staleTime` default: `30_000` ms.
- Pilihan baris per halaman tabel: `10, 25, 50, 100`. Default `10`. `TableVirtuoso` dipakai saat baris yang ditampilkan lebih dari `10`, dengan tinggi wadah `560` px.
- Tidak ada perubahan di `server/`.
- **Jangan menjalankan `git commit` atau `git push`.** Di akhir setiap tahap, berhenti dan serahkan pesan commit kepada pengguna. Spec dan plan ini tidak di-commit.
- Perintah verifikasi: `npm test`, `npx tsc --noEmit -p .`, `npx eslint src`, `npx next build`.

## Review Focus

1. **Verifikasi tunai di daftar yang difilter status.** Kasir memverifikasi pembayaran di dashboard atau di tab "Menunggu". Setelah berhasil, pesanan itu keluar dari daftar. Kalau daftar disegarkan saat itu juga, modal ikut hilang sebelum kasir membaca nominal kembalian. Penyegaran data harus ditunda sampai modal ditutup. Diuji di checklist manual Task 10.
2. **Mutasi lalu refetch langsung.** Mengubah status pesanan lalu langsung menyegarkan daftar tidak boleh mengembalikan data lama dari cache adapter 5 detik. Halaman 1 harus selalu mengambil ulang dari server. Diuji di Task 3.
3. **Pesanan baru masuk saat pengguna scroll.** Pagination offset bisa bergeser sehingga pesanan yang sama muncul di dua halaman. Kartu tidak boleh dobel. Diuji di Task 2.
4. **Menghapus baris terakhir di halaman terakhir.** Tabel tidak boleh tampil kosong dengan tombol halaman yang menunjuk ke halaman yang sudah tidak ada. Diuji di Task 1 (client) dan checklist Task 13 (stok, server).
5. **Jaringan putus sesaat saat memuat daftar pesanan.** Load yang gagal tidak boleh tersimpan di cache adapter, supaya percobaan berikutnya langsung mengambil ulang. Diuji di Task 2.

---

# Tahap 1 — Fondasi

### Task 1: Vitest dan helper pagination

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mts`
- Create: `src/lib/pagination.ts`
- Test: `src/lib/pagination.test.ts`
- Modify: `src/components/shared/table-pagination.tsx`

**Interfaces:**
- Produces: `paginate<T>(items: T[], currentPage: number, pageSize: number): T[]`, `getPaginationView(requestedPage: number, pageSize: number, totalItems: number): { currentPage: number; totalPages: number; rowNumberOffset: number }` dari `@/lib/pagination`.

- [ ] **Step 1: Pasang paket**

Run:
```bash
npm install @tanstack/react-query@^5.103.2 @tanstack/react-query-devtools@^5.103.2 react-virtuoso@^4.18.15
npm install -D vitest@^5.0.2
```
Expected: keempat paket muncul di `package.json`.

- [ ] **Step 2: Tambah script test dan konfigurasi Vitest**

Di `package.json`, bagian `"scripts"`, tambahkan setelah `"lint": "eslint"`:
```json
    "test": "vitest run"
```

Create `vitest.config.mts`:
```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
```

- [ ] **Step 3: Tulis test yang gagal**

Create `src/lib/pagination.test.ts`:
```ts
import { describe, expect, it } from "vitest"
import { getPaginationView, paginate } from "./pagination"

describe("getPaginationView", () => {
  it("counts pages from the total number of items", () => {
    expect(getPaginationView(1, 10, 25).totalPages).toBe(3)
  })

  it("keeps one page when there are no items", () => {
    expect(getPaginationView(1, 10, 0)).toEqual({ currentPage: 1, totalPages: 1, rowNumberOffset: 0 })
  })

  it("moves back to the last page when the requested page no longer exists", () => {
    expect(getPaginationView(3, 10, 20).currentPage).toBe(2)
  })

  it("never goes below the first page", () => {
    expect(getPaginationView(0, 10, 5).currentPage).toBe(1)
  })

  it("computes the row number offset of the current page", () => {
    expect(getPaginationView(2, 25, 60).rowNumberOffset).toBe(25)
  })
})

describe("paginate", () => {
  it("returns only the items of the requested page", () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4])
  })
})
```

- [ ] **Step 4: Jalankan test dan pastikan gagal**

Run: `npm test`
Expected: FAIL, `Failed to resolve import "./pagination"`.

- [ ] **Step 5: Implementasi**

Create `src/lib/pagination.ts`:
```ts
export function paginate<T>(items: T[], currentPage: number, pageSize: number) {
  return items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}

export function getPaginationView(requestedPage: number, pageSize: number, totalItems: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages)
  return { currentPage, totalPages, rowNumberOffset: (currentPage - 1) * pageSize }
}
```

Di `src/components/shared/table-pagination.tsx`, hapus fungsi `paginate` di akhir file:
```ts
export function paginate<T>(items: T[], currentPage: number, pageSize: number) {
  return items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}
```
Lalu ubah semua import `paginate` dari `"@/components/shared/table-pagination"` menjadi dari `"@/lib/pagination"` di `src/components/manager/menu/menu-table.tsx`, `src/components/manager/staff/staff-table.tsx`, dan `src/components/manager/sales-report/report-table.tsx`. Contoh untuk `menu-table.tsx`:
```ts
import { TablePagination } from "@/components/shared/table-pagination"
import { paginate } from "@/lib/pagination"
```

- [ ] **Step 6: Jalankan test dan type-check**

Run: `npm test && npx tsc --noEmit -p .`
Expected: 6 test PASS, tsc tanpa output.

### Task 2: Cache promise berbatas waktu dan helper halaman pesanan

**Files:**
- Create: `src/lib/timed-promise-cache.ts`
- Test: `src/lib/timed-promise-cache.test.ts`
- Create: `src/lib/order-list-page.ts`
- Test: `src/lib/order-list-page.test.ts`
- Create: `src/test/build-order.ts`
- Modify: `src/types/order.ts`
- Modify: `src/lib/order.ts`
- Test: `src/lib/order.test.ts`

**Interfaces:**
- Produces:
  - `createTimedPromiseCache<Value>(ttlMs: number, now?: () => number): { load(key: string, loader: () => Promise<Value>, options?: { forceRefresh?: boolean }): Promise<Value> }`
  - `ORDER_PAGE_SIZE = 20`
  - `matchesOrderSearch(order: Order, search: string): boolean`
  - `sliceOrderPage(orders: Order[], params: { page: number; limit: number; search: string }): OrderPage`
  - `getNextOrderPageParam(lastPage: OrderPage, allPages: OrderPage[]): number | undefined`
  - `flattenUniqueOrders(pages: OrderPage[]): Order[]`
  - `resolveOrderStatusFilter(tabStatus: OrderStatus | null, dropdownStatuses: number[]): number[]`
  - `isFinalOrderStatus(status: number): boolean` di `@/lib/order`
  - Tipe `OrderPageParams` dan `OrderPage` di `@/types/order`

- [ ] **Step 1: Tambah tipe halaman pesanan**

Di `src/types/order.ts`, tambahkan di akhir file:
```ts
export interface OrderPageParams {
  page: number;
  limit: number;
  statuses: number[];
  search: string;
}

export interface OrderPage {
  orders: Order[];
  count: number;
  hasNextPage: boolean;
}
```

- [ ] **Step 2: Buat fixture pesanan untuk test**

Create `src/test/build-order.ts`:
```ts
import { OrderStatus, OrderType, type Order } from "@/types/order"

export function buildOrder(id: number, overrides: Partial<Order> = {}): Order {
  return {
    id,
    table_id: id,
    order_type: OrderType.DINE_IN,
    order_type_name: "Dine In",
    customer_name: null,
    total_price: 10000,
    status: OrderStatus.PENDING,
    status_name: "Pending",
    items: [],
    ...overrides,
  }
}
```

- [ ] **Step 3: Tulis test cache yang gagal**

Create `src/lib/timed-promise-cache.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest"
import { createTimedPromiseCache } from "./timed-promise-cache"

describe("createTimedPromiseCache", () => {
  it("reuses the cached value before the time limit", async () => {
    let currentTime = 0
    const cache = createTimedPromiseCache<number>(5000, () => currentTime)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    currentTime = 4999
    await cache.load("orders", loader)

    expect(loader).toHaveBeenCalledTimes(1)
  })

  it("loads again once the time limit has passed", async () => {
    let currentTime = 0
    const cache = createTimedPromiseCache<number>(5000, () => currentTime)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    currentTime = 5000
    await cache.load("orders", loader)

    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("always loads again when forceRefresh is set", async () => {
    const cache = createTimedPromiseCache<number>(5000, () => 0)
    const loader = vi.fn().mockResolvedValue(1)

    await cache.load("orders", loader)
    await cache.load("orders", loader, { forceRefresh: true })

    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("does not keep a failed load", async () => {
    const cache = createTimedPromiseCache<number>(5000, () => 0)
    const loader = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(2)

    await expect(cache.load("orders", loader)).rejects.toThrow("offline")
    await expect(cache.load("orders", loader)).resolves.toBe(2)
  })

  it("keeps a separate entry for each key", async () => {
    const cache = createTimedPromiseCache<string>(5000, () => 0)

    await cache.load("pending", async () => "pending orders")
    const processingOrders = await cache.load("processing", async () => "processing orders")

    expect(processingOrders).toBe("processing orders")
  })
})
```

- [ ] **Step 4: Tulis test helper halaman pesanan yang gagal**

Create `src/lib/order-list-page.test.ts`:
```ts
import { buildOrder } from "@/test/build-order"
import { OrderStatus, OrderType } from "@/types/order"
import { describe, expect, it } from "vitest"
import {
  flattenUniqueOrders,
  getNextOrderPageParam,
  matchesOrderSearch,
  resolveOrderStatusFilter,
  sliceOrderPage,
} from "./order-list-page"

describe("matchesOrderSearch", () => {
  it("matches every order when the search is blank", () => {
    expect(matchesOrderSearch(buildOrder(1), "   ")).toBe(true)
  })

  it("matches the table code and table name regardless of case", () => {
    const order = buildOrder(1, { table_id: 7 })
    expect(matchesOrderSearch(order, "t-07")).toBe(true)
    expect(matchesOrderSearch(order, "MEJA 07")).toBe(true)
  })

  it("matches the customer name", () => {
    expect(matchesOrderSearch(buildOrder(1, { customer_name: "Budi Santoso" }), "budi")).toBe(true)
  })

  it("matches the order number written with a hash", () => {
    expect(matchesOrderSearch(buildOrder(42), "#42")).toBe(true)
  })

  it("matches take away orders by their label", () => {
    const takeAwayOrder = buildOrder(1, { table_id: null, order_type: OrderType.TAKE_AWAY })
    expect(matchesOrderSearch(takeAwayOrder, "take away")).toBe(true)
  })

  it("rejects orders that do not contain the search text", () => {
    expect(matchesOrderSearch(buildOrder(1, { customer_name: "Budi" }), "siti")).toBe(false)
  })
})

describe("sliceOrderPage", () => {
  const orders = Array.from({ length: 45 }, (_, index) => buildOrder(index + 1))

  it("returns the requested page and reports that more pages exist", () => {
    const page = sliceOrderPage(orders, { page: 2, limit: 20, search: "" })
    expect(page.orders.map((order) => order.id)).toEqual(Array.from({ length: 20 }, (_, index) => index + 21))
    expect(page.count).toBe(45)
    expect(page.hasNextPage).toBe(true)
  })

  it("reports no next page on the last page", () => {
    const page = sliceOrderPage(orders, { page: 3, limit: 20, search: "" })
    expect(page.orders).toHaveLength(5)
    expect(page.hasNextPage).toBe(false)
  })

  it("counts only the orders that match the search", () => {
    const namedOrders = [buildOrder(1, { customer_name: "Budi" }), buildOrder(2, { customer_name: "Siti" })]
    const page = sliceOrderPage(namedOrders, { page: 1, limit: 20, search: "siti" })
    expect(page.count).toBe(1)
    expect(page.orders[0].id).toBe(2)
  })
})

describe("getNextOrderPageParam", () => {
  it("asks for the page after the pages already loaded", () => {
    const firstPage = { orders: [], count: 40, hasNextPage: true }
    expect(getNextOrderPageParam(firstPage, [firstPage])).toBe(2)
  })

  it("stops when the last page has no next page", () => {
    const lastPage = { orders: [], count: 10, hasNextPage: false }
    expect(getNextOrderPageParam(lastPage, [lastPage])).toBeUndefined()
  })
})

describe("flattenUniqueOrders", () => {
  it("keeps the first copy when an order appears on two pages", () => {
    const pages = [
      { orders: [buildOrder(3), buildOrder(2)], count: 4, hasNextPage: true },
      { orders: [buildOrder(2), buildOrder(1)], count: 4, hasNextPage: false },
    ]
    expect(flattenUniqueOrders(pages).map((order) => order.id)).toEqual([3, 2, 1])
  })
})

describe("resolveOrderStatusFilter", () => {
  it("uses the dropdown selection over the tab and sorts it", () => {
    expect(resolveOrderStatusFilter(OrderStatus.PENDING, [OrderStatus.READY, OrderStatus.PROCESSING])).toEqual([
      OrderStatus.PROCESSING,
      OrderStatus.READY,
    ])
  })

  it("uses the tab status when the dropdown is empty", () => {
    expect(resolveOrderStatusFilter(OrderStatus.READY, [])).toEqual([OrderStatus.READY])
  })

  it("returns no filter for the all tab", () => {
    expect(resolveOrderStatusFilter(null, [])).toEqual([])
  })
})
```

Create `src/lib/order.test.ts`:
```ts
import { OrderStatus } from "@/types/order"
import { describe, expect, it } from "vitest"
import { isFinalOrderStatus } from "./order"

describe("isFinalOrderStatus", () => {
  it("treats completed and canceled orders as final", () => {
    expect(isFinalOrderStatus(OrderStatus.COMPLETED)).toBe(true)
    expect(isFinalOrderStatus(OrderStatus.CANCELED)).toBe(true)
  })

  it("keeps active orders polling", () => {
    expect(isFinalOrderStatus(OrderStatus.PENDING)).toBe(false)
    expect(isFinalOrderStatus(OrderStatus.READY)).toBe(false)
  })
})
```

- [ ] **Step 5: Jalankan test dan pastikan gagal**

Run: `npm test`
Expected: FAIL, modul `./timed-promise-cache` dan `./order-list-page` tidak ditemukan, dan `isFinalOrderStatus` bukan fungsi.

- [ ] **Step 6: Implementasi**

Create `src/lib/timed-promise-cache.ts`:
```ts
type CacheEntry<Value> = {
  promise: Promise<Value>
  storedAt: number
}

export function createTimedPromiseCache<Value>(ttlMs: number, now: () => number = Date.now) {
  const entries = new Map<string, CacheEntry<Value>>()

  return {
    load(key: string, loader: () => Promise<Value>, { forceRefresh = false } = {}) {
      const cachedEntry = entries.get(key)
      if (!forceRefresh && cachedEntry && now() - cachedEntry.storedAt < ttlMs) return cachedEntry.promise

      const promise = loader()
      entries.set(key, { promise, storedAt: now() })
      promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key)
      })
      return promise
    },
  }
}
```

Create `src/lib/order-list-page.ts`:
```ts
import { getOrderPlace } from "@/lib/order-place"
import type { Order, OrderPage, OrderStatus } from "@/types/order"

export const ORDER_PAGE_SIZE = 20

export function matchesOrderSearch(order: Order, search: string) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return true
  const place = getOrderPlace(order)
  return [place.code, place.name, order.customer_name ?? "", `#${order.id}`]
    .join(" ")
    .toLowerCase()
    .includes(normalizedSearch)
}

export function sliceOrderPage(
  orders: Order[],
  { page, limit, search }: { page: number; limit: number; search: string },
): OrderPage {
  const matchingOrders = orders.filter((order) => matchesOrderSearch(order, search))
  const startIndex = (page - 1) * limit
  return {
    orders: matchingOrders.slice(startIndex, startIndex + limit),
    count: matchingOrders.length,
    hasNextPage: startIndex + limit < matchingOrders.length,
  }
}

export function getNextOrderPageParam(lastPage: OrderPage, allPages: OrderPage[]) {
  return lastPage.hasNextPage ? allPages.length + 1 : undefined
}

export function flattenUniqueOrders(pages: OrderPage[]) {
  const seenOrderIds = new Set<number>()
  const uniqueOrders: Order[] = []
  for (const page of pages) {
    for (const order of page.orders) {
      if (seenOrderIds.has(order.id)) continue
      seenOrderIds.add(order.id)
      uniqueOrders.push(order)
    }
  }
  return uniqueOrders
}

export function resolveOrderStatusFilter(tabStatus: OrderStatus | null, dropdownStatuses: number[]) {
  if (dropdownStatuses.length > 0) return [...dropdownStatuses].sort((first, second) => first - second)
  return tabStatus === null ? [] : [tabStatus]
}
```

Di `src/lib/order.ts`, ubah baris import pertama dan tambahkan fungsi di akhir file:
```ts
import { OrderStatus, type Order, type OrderItem } from "@/types/order"
```
```ts
export function isFinalOrderStatus(status: number) {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELED
}
```

- [ ] **Step 7: Jalankan test**

Run: `npm test && npx tsc --noEmit -p .`
Expected: semua test PASS, tsc tanpa output.

### Task 3: Adapter `orderService.getPage` dan `paymentService.findByOrderId`

**Files:**
- Modify: `src/services/order.service.ts`
- Test: `src/services/order.service.test.ts`
- Modify: `src/services/payment.service.ts`
- Test: `src/services/payment.service.test.ts`

**Interfaces:**
- Consumes: `createTimedPromiseCache`, `sliceOrderPage` dari Task 2.
- Produces: `orderService.getPage(params: OrderPageParams): Promise<OrderPage>` dan `paymentService.findByOrderId(orderId: number): Promise<Payment | null>`. `paymentService.getByOrderId` dihapus.

- [ ] **Step 1: Tulis test yang gagal**

Create `src/services/order.service.test.ts`:
```ts
import { buildOrder } from "@/test/build-order"
import { OrderStatus } from "@/types/order"
import { beforeEach, describe, expect, it, vi } from "vitest"

const apiGet = vi.hoisted(() => vi.fn())
vi.mock("./api-client", () => ({ default: { get: apiGet } }))

import { orderService } from "./order.service"

const pendingOrders = Array.from({ length: 25 }, (_, index) => buildOrder(index + 1))

describe("orderService.getPage", () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiGet.mockResolvedValue(pendingOrders)
  })

  it("loads the first page from the server every time", async () => {
    const params = { page: 1, limit: 20, statuses: [OrderStatus.PENDING], search: "" }

    await orderService.getPage(params)
    await orderService.getPage(params)

    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it("serves later pages from the list loaded for the first page", async () => {
    const statuses = [OrderStatus.PROCESSING]

    await orderService.getPage({ page: 1, limit: 20, statuses, search: "" })
    const secondPage = await orderService.getPage({ page: 2, limit: 20, statuses, search: "" })

    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(secondPage.orders.map((order) => order.id)).toEqual([21, 22, 23, 24, 25])
    expect(secondPage.hasNextPage).toBe(false)
  })

  it("sends the status filter to the server", async () => {
    await orderService.getPage({ page: 1, limit: 20, statuses: [OrderStatus.READY], search: "" })

    expect(apiGet).toHaveBeenCalledWith("/orders", { params: { status: JSON.stringify([OrderStatus.READY]) } })
  })
})
```

Create `src/services/payment.service.test.ts`:
```ts
import { AxiosError, type AxiosResponse } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

const apiGet = vi.hoisted(() => vi.fn())
vi.mock("./api-client", () => ({ default: { get: apiGet } }))

import { paymentService } from "./payment.service"

const buildAxiosError = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, { status } as AxiosResponse)

describe("paymentService.findByOrderId", () => {
  beforeEach(() => apiGet.mockReset())

  it("returns null when the order has no payment yet", async () => {
    apiGet.mockRejectedValue(buildAxiosError(404))
    await expect(paymentService.findByOrderId(7)).resolves.toBeNull()
  })

  it("rethrows other failures", async () => {
    apiGet.mockRejectedValue(buildAxiosError(500))
    await expect(paymentService.findByOrderId(7)).rejects.toBeInstanceOf(AxiosError)
  })
})
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `npm test`
Expected: FAIL, `orderService.getPage is not a function` dan `paymentService.findByOrderId is not a function`.

- [ ] **Step 3: Implementasi**

Replace `src/services/order.service.ts` seluruhnya:
```ts
import { sliceOrderPage } from "@/lib/order-list-page";
import { createTimedPromiseCache } from "@/lib/timed-promise-cache";
import type {
  CancelOrderRequest,
  CreateOrderRequest,
  Order,
  OrderPage,
  OrderPageParams,
  UpdateOrderStatusRequest,
} from "@/types/order";
import apiClient from "./api-client";

const ORDERS_PATH = "/orders";
const ORDER_LIST_CACHE_TTL_MS = 5_000;

const allOrdersCache = createTimedPromiseCache<Order[]>(ORDER_LIST_CACHE_TTL_MS);

export const orderService = {
  async getAll(params?: { statuses?: number[] }): Promise<Order[]> {
    const query: Record<string, string> = {};
    if (params?.statuses && params.statuses.length > 0) {
      query.status = JSON.stringify(params.statuses);
    }
    return apiClient.get(ORDERS_PATH, { params: query });
  },

  async getPage({ page, limit, statuses, search }: OrderPageParams): Promise<OrderPage> {
    const orders = await allOrdersCache.load(
      JSON.stringify(statuses),
      () => orderService.getAll({ statuses }),
      { forceRefresh: page === 1 },
    );
    return sliceOrderPage(Array.isArray(orders) ? orders : [], { page, limit, search });
  },

  async getById(id: number): Promise<Order> {
    return apiClient.get(`${ORDERS_PATH}/${id}`);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    return apiClient.post(ORDERS_PATH, data);
  },

  async updateStatus(id: number, data: UpdateOrderStatusRequest): Promise<Order> {
    return apiClient.patch(`${ORDERS_PATH}/${id}/status`, data);
  },

  async cancel(id: number, data: CancelOrderRequest): Promise<Order> {
    return apiClient.patch(`${ORDERS_PATH}/${id}/cancel`, data);
  },
};
```

Di `src/services/payment.service.ts`, ganti method `getByOrderId` dengan `findByOrderId`, dan tambahkan import `isAxiosError`:
```ts
import { isAxiosError } from "axios";
import apiClient from "./api-client";
import type { CashPaymentResult, Payment, SnapTransaction } from "@/types/payment";
```
```ts
  async findByOrderId(orderId: number): Promise<Payment | null> {
    try {
      return await apiClient.get(`${PAYMENTS_PATH}/order/${orderId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },
```

- [ ] **Step 4: Jalankan test**

Run: `npm test`
Expected: semua test PASS.

Run: `npx tsc --noEmit -p .`
Expected: satu error di `src/components/shared/order/payment-verification-modal.tsx` karena `getByOrderId` sudah tidak ada. Error ini diselesaikan di Task 10. Pemanggil `getAll({ status, search })` di `order-page.tsx` juga error karena parameter `status`/`search` dihapus, dan diselesaikan di Task 8. Untuk menjaga tahap ini tetap bisa di-build, lakukan Step 5.

- [ ] **Step 5: Jaga pemanggil lama tetap jalan sampai Tahap 2**

Di `src/components/shared/order/payment-verification-modal.tsx`, ganti:
```ts
        const existingPayment = await paymentService.getByOrderId(order.id)
        setPayment(existingPayment)
        setSelectedMethod(existingPayment.type === PaymentType.ONLINE ? "online" : "cash")
        setIsMethodLocked(true)
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 404) setSelectedMethod("cash")
        else setHasPaymentLoadError(true)
      } finally {
```
dengan:
```ts
        const existingPayment = await paymentService.findByOrderId(order.id)
        if (existingPayment) {
          setPayment(existingPayment)
          setSelectedMethod(existingPayment.type === PaymentType.ONLINE ? "online" : "cash")
          setIsMethodLocked(true)
        }
      } catch {
        setHasPaymentLoadError(true)
      } finally {
```

Di `src/components/shared/order/order-page.tsx`, ganti isi `try` di `fetchOrders`:
```ts
      const data = await orderService.getAll({
        ...(statuses.length > 0
          ? { statuses }
          : tabStatus !== null
            ? { status: tabStatus }
            : {}),
        ...(searchTerm && { search: searchTerm }),
      })
      if (isLatest()) setOrders(Array.isArray(data) ? data : [])
```
dengan:
```ts
      const firstPage = await orderService.getPage({
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
        statuses: statuses.length > 0 ? statuses : tabStatus !== null ? [tabStatus] : [],
        search: searchTerm,
      })
      if (isLatest()) setOrders(firstPage.orders)
```

Run: `npx tsc --noEmit -p .`
Expected: tanpa output.

### Task 4: QueryClient, queryKey, dan provider aplikasi

**Files:**
- Create: `src/lib/query-client.ts`
- Test: `src/lib/query-client.test.ts`
- Create: `src/lib/query-keys.ts`
- Create: `src/components/providers/app-providers.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `shouldRetryQuery(failureCount: number, error: unknown): boolean` dan `createQueryClient(): QueryClient` dari `@/lib/query-client`.
  - `queryKeys` beserta tipe `OrderListFilters`, `StockListFilters`, `MenuListFilters`, `StaffListFilters`, `SellingReportListFilters` dari `@/lib/query-keys`.
  - `AppProviders` dari `@/components/providers/app-providers`.

- [ ] **Step 1: Tulis test yang gagal**

Create `src/lib/query-client.test.ts`:
```ts
import { AxiosError, type AxiosResponse } from "axios"
import { describe, expect, it } from "vitest"
import { shouldRetryQuery } from "./query-client"

const buildAxiosError = (status?: number) =>
  new AxiosError(
    "Request failed",
    status ? "ERR_BAD_RESPONSE" : "ERR_NETWORK",
    undefined,
    undefined,
    status ? ({ status } as AxiosResponse) : undefined,
  )

describe("shouldRetryQuery", () => {
  it("retries a network error once", () => {
    expect(shouldRetryQuery(0, buildAxiosError())).toBe(true)
    expect(shouldRetryQuery(1, buildAxiosError())).toBe(false)
  })

  it("retries a server error once", () => {
    expect(shouldRetryQuery(0, buildAxiosError(503))).toBe(true)
  })

  it("does not retry client errors", () => {
    expect(shouldRetryQuery(0, buildAxiosError(404))).toBe(false)
    expect(shouldRetryQuery(0, buildAxiosError(401))).toBe(false)
  })
})
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `npm test`
Expected: FAIL, modul `./query-client` tidak ditemukan.

- [ ] **Step 3: Implementasi QueryClient dan queryKey**

Create `src/lib/query-client.ts`:
```ts
import { QueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

const QUERY_STALE_TIME_MS = 30_000
const MAX_QUERY_RETRIES = 1

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= MAX_QUERY_RETRIES) return false
  if (!isAxiosError(error)) return true
  const status = error.response?.status
  return status === undefined || status >= 500
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
```

Create `src/lib/query-keys.ts`:
```ts
import type { ChartPeriod } from "@/types/dashboard"
import type { MetricKey } from "@/types/selling-trend"

export type OrderListFilters = { statuses: number[]; search: string }
export type StockListFilters = { search: string; statuses: number[]; page: number; pageSize: number }
export type MenuListFilters = { search: string; statuses: number[] }
export type StaffListFilters = { search: string; roles: number[] }
export type SellingReportListFilters = { search: string; month: string; year: string }

export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    list: (filters: OrderListFilters) => ["orders", "list", filters] as const,
    detail: (orderId: number) => ["orders", "detail", orderId] as const,
  },
  payments: {
    all: ["payments"] as const,
    byOrder: (orderId: number) => ["payments", "order", orderId] as const,
  },
  stocks: {
    all: ["stocks"] as const,
    list: (filters: StockListFilters) => ["stocks", "list", filters] as const,
    detail: (stockId: number) => ["stocks", "detail", stockId] as const,
  },
  units: {
    all: ["units"] as const,
    list: () => ["units", "list"] as const,
  },
  menus: {
    all: ["menus"] as const,
    list: (filters: MenuListFilters) => ["menus", "list", filters] as const,
    detail: (menuId: number) => ["menus", "detail", menuId] as const,
  },
  staff: {
    all: ["staff"] as const,
    list: (filters: StaffListFilters) => ["staff", "list", filters] as const,
  },
  sellingReports: {
    all: ["selling-reports"] as const,
    list: (filters: SellingReportListFilters) => ["selling-reports", "list", filters] as const,
  },
  tables: {
    all: ["tables"] as const,
    list: () => ["tables", "list"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    cashierStats: () => ["dashboard", "cashier", "stats"] as const,
    cashierActiveOrders: () => ["dashboard", "cashier", "active-orders"] as const,
    cashierPendingPayments: () => ["dashboard", "cashier", "pending-payments"] as const,
    managerStats: () => ["dashboard", "manager", "stats"] as const,
    managerChart: (period: ChartPeriod) => ["dashboard", "manager", "chart", period] as const,
  },
  predictions: {
    all: ["predictions"] as const,
    forecast: (days: number) => ["predictions", "forecast", days] as const,
    accuracy: (metric: MetricKey) => ["predictions", "accuracy", metric] as const,
  },
}
```

- [ ] **Step 4: Buat provider dan pasang di layout**

Create `src/components/providers/app-providers.tsx`:
```tsx
"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { createQueryClient } from "@/lib/query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { Toaster } from "sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CartProvider>{children}</CartProvider>
        </TooltipProvider>
        <Toaster position="top-right" richColors />
      </AuthProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}
```

Replace `src/app/layout.tsx` seluruhnya:
```tsx
import { AppProviders } from "@/components/providers/app-providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat-a Log",
  description: "POS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Jalankan test dan build**

Run: `npm test && npx tsc --noEmit -p . && npx eslint src`
Expected: semua test PASS, tsc dan eslint tanpa error.

### Task 5: Dokumen kontrak API pagination pesanan

**Files:**
- Create: `../docs/api/orders-pagination-contract.md` (di root repo, bukan di `client/`)

- [ ] **Step 1: Tulis dokumen**

Create `docs/api/orders-pagination-contract.md` (path dari root repo):
````markdown
# Kontrak API: Pagination `GET /orders`

Status: belum diimplementasikan di server. Client sudah siap memakainya.

## Kenapa dibutuhkan

Halaman pesanan kasir, manager, dan dapur memakai infinite scroll 20 pesanan per muat.
Saat ini client mengambil semua pesanan lalu memotongnya sendiri di
`client/src/services/order.service.ts` (`orderService.getPage`). Setelah endpoint ini
mendukung pagination, cukup isi `getPage` yang diganti.

## Permintaan

`GET /orders?page=1&limit=20&status=[0,1]&search=budi`

| Parameter | Wajib | Keterangan |
|---|---|---|
| `page` | Tidak | Mulai dari 1. |
| `limit` | Tidak | Default 20, maksimal 100. |
| `status` | Tidak | Satu angka atau array JSON status pesanan. Perilaku sama dengan sekarang. |
| `search` | Tidak | Cocok ke `id`, `table_id`, `customer_name` (LIKE, tidak peka huruf besar), dan kata "take away"/"TA" untuk pesanan Take Away. |

Jika `page` dan `limit` tidak dikirim, respons tetap array semua pesanan seperti sekarang,
agar pemanggil lama tidak rusak.

## Respons (dengan `page`/`limit`)

```json
{
  "statusCode": 200,
  "message": "Successfully retrieved all orders",
  "data": {
    "count": 137,
    "orders": [ { "id": 137, "items": [], "payment": null } ]
  }
}
```

`count` adalah jumlah seluruh pesanan yang cocok dengan filter, bukan jumlah di halaman ini.

## Catatan implementasi server

- Gunakan `findAndCountAll` dengan `distinct: true`. Pesanan di-join dengan banyak
  `OrderItem`, dan tanpa `distinct` nilai `count` dihitung per item.
- Urutkan `created_at DESC, id DESC`, supaya pesanan dengan waktu sama tidak tertukar antar
  halaman.
- Pisahkan pembentukan `where`, `limit`, dan `offset` ke fungsi murni seperti
  `order-placement.util.ts`, lalu uji dengan Jest.
- Jangan memakai `QueryBuilderHelper`, karena file itu masih punya error TypeScript.

## Perubahan di client setelah server siap

Ganti isi `orderService.getPage` menjadi:

```ts
const response: { count: number; orders: Order[] } = await apiClient.get(ORDERS_PATH, {
  params: { page, limit, search: search || undefined, status: statuses.length > 0 ? JSON.stringify(statuses) : undefined },
})
return { orders: response.orders, count: response.count, hasNextPage: page * limit < response.count }
```

Lalu hapus `allOrdersCache`, `sliceOrderPage`, dan test yang hanya menguji adapter.
````

### Checkpoint Tahap 1

- [ ] Run: `npm test && npx tsc --noEmit -p . && npx eslint src && npx next build`
Expected: semua PASS dan build berhasil.
- [ ] Tes manual singkat: buka `/cashier/order` dan `/kitchen/order`, pastikan pesanan tetap tampil. Buka modal verifikasi pembayaran pada pesanan tanpa payment, pastikan pilihan Tunai muncul.
- [ ] Berhenti. Serahkan pesan commit kepada pengguna:
```
feat(client): add TanStack Query foundation and order page adapter

- Install @tanstack/react-query, devtools, react-virtuoso and vitest
- Add query client, central query keys and AppProviders
- Add orderService.getPage adapter with a 5s cache and tests
- Add paymentService.findByOrderId and pagination helpers
- Document the planned GET /orders pagination contract

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
Path yang di-stage: `client/` dan `docs/api/`.

---

# Tahap 2 — Pesanan

### Task 6: Hook pesanan, pembayaran, dan dashboard kasir

**Files:**
- Create: `src/hooks/queries/use-orders.ts`
- Create: `src/hooks/queries/use-payments.ts`
- Create: `src/hooks/queries/use-dashboard.ts`

**Interfaces:**
- Consumes: `queryKeys`, `OrderListFilters` (Task 4), `orderService.getPage`, `paymentService.findByOrderId` (Task 3), `flattenUniqueOrders`, `getNextOrderPageParam`, `ORDER_PAGE_SIZE` (Task 2), `isFinalOrderStatus` (Task 2).
- Produces:
  - `KITCHEN_ORDER_POLL_INTERVAL_MS = 10_000`
  - `useOrderList(filters: OrderListFilters, options?: { pollIntervalMs?: number })` mengembalikan hasil `useInfiniteQuery` ditambah `orders: Order[]`
  - `useOrderDetail(orderId: number, options?: { pollUntilFinal?: boolean })`
  - `useRefreshOrderData(): () => Promise<unknown>`
  - `useUpdateOrderStatus()` dengan variabel `{ orderId: number; status: number }`
  - `useCancelOrder()` dengan variabel `{ orderId: number; reason: string }`
  - `usePaymentForOrder(orderId: number)`
  - `useVerifyCashPayment()` dengan variabel `{ orderId: number; receivedAmount: number }`
  - `useCashierStats()`, `useCashierActiveOrders()`, `useCashierPendingPayments()`, `useManagerStats()`, `useManagerChart(period: ChartPeriod)`

- [ ] **Step 1: Buat hook pesanan**

Create `src/hooks/queries/use-orders.ts`:
```ts
import { isFinalOrderStatus } from "@/lib/order"
import { flattenUniqueOrders, getNextOrderPageParam, ORDER_PAGE_SIZE } from "@/lib/order-list-page"
import { queryKeys, type OrderListFilters } from "@/lib/query-keys"
import { orderService } from "@/services/order.service"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

export const KITCHEN_ORDER_POLL_INTERVAL_MS = 10_000
const ORDER_STATUS_POLL_INTERVAL_MS = 8_000

export function useOrderList(filters: OrderListFilters, { pollIntervalMs }: { pollIntervalMs?: number } = {}) {
  const orderListQuery = useInfiniteQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: ({ pageParam }) => orderService.getPage({ ...filters, page: pageParam, limit: ORDER_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: getNextOrderPageParam,
    refetchInterval: pollIntervalMs ?? false,
  })
  const orders = useMemo(() => flattenUniqueOrders(orderListQuery.data?.pages ?? []), [orderListQuery.data])
  return { ...orderListQuery, orders }
}

export function useOrderDetail(orderId: number, { pollUntilFinal = false }: { pollUntilFinal?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getById(orderId),
    enabled: Number.isInteger(orderId) && orderId > 0,
    refetchInterval: (query) => {
      if (!pollUntilFinal) return false
      const order = query.state.data
      return order && isFinalOrderStatus(Number(order.status)) ? false : ORDER_STATUS_POLL_INTERVAL_MS
    },
  })
}

export function useRefreshOrderData() {
  const queryClient = useQueryClient()
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
      ]),
    [queryClient],
  )
}

export function useUpdateOrderStatus() {
  const refreshOrderData = useRefreshOrderData()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: number }) =>
      orderService.updateStatus(orderId, { status }),
    onSuccess: refreshOrderData,
  })
}

export function useCancelOrder() {
  const refreshOrderData = useRefreshOrderData()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) => orderService.cancel(orderId, { reason }),
    onSuccess: refreshOrderData,
  })
}
```

- [ ] **Step 2: Buat hook pembayaran**

Create `src/hooks/queries/use-payments.ts`:
```ts
import { queryKeys } from "@/lib/query-keys"
import { paymentService } from "@/services/payment.service"
import { useMutation, useQuery } from "@tanstack/react-query"

export function usePaymentForOrder(orderId: number) {
  return useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.findByOrderId(orderId),
  })
}

export function useVerifyCashPayment() {
  return useMutation({
    mutationFn: ({ orderId, receivedAmount }: { orderId: number; receivedAmount: number }) =>
      paymentService.verifyCashPayment(orderId, receivedAmount),
  })
}
```

`useVerifyCashPayment` sengaja tidak menginvalidasi apa pun. Lihat Review Focus 1: pemanggil menjalankan `useRefreshOrderData()` saat modal ditutup.

- [ ] **Step 3: Buat hook dashboard**

Create `src/hooks/queries/use-dashboard.ts`:
```ts
import { queryKeys } from "@/lib/query-keys"
import { dashboardService } from "@/services/dashboard.service"
import type { ChartPeriod } from "@/types/dashboard"
import { useQuery } from "@tanstack/react-query"

export function useCashierStats() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierStats(), queryFn: dashboardService.getCashierStats })
}

export function useCashierActiveOrders() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierActiveOrders(), queryFn: dashboardService.getActiveOrders })
}

export function useCashierPendingPayments() {
  return useQuery({ queryKey: queryKeys.dashboard.cashierPendingPayments(), queryFn: dashboardService.getPendingPayments })
}

export function useManagerStats() {
  return useQuery({ queryKey: queryKeys.dashboard.managerStats(), queryFn: dashboardService.getManagerStats })
}

export function useManagerChart(period: ChartPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.managerChart(period),
    queryFn: () => dashboardService.getManagerChartData(period),
  })
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 7: `OrderGrid` dengan `VirtuosoGrid` dan tinggi kartu tetap

**Files:**
- Create: `src/components/shared/order/order-grid.tsx`
- Modify: `src/components/shared/order/order-summary.tsx:255`

**Interfaces:**
- Produces: `OrderGrid` dengan props `{ orders: Order[]; gridColumnsClass: string; renderOrder: (order: Order) => React.ReactNode; hasNextPage: boolean; isFetchingNextPage: boolean; hasNextPageError: boolean; onLoadNextPage: () => void }`.

- [ ] **Step 1: Samakan tinggi daftar item di kartu**

Di `src/components/shared/order/order-summary.tsx`, ganti:
```tsx
        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
```
dengan:
```tsx
        <div className="flex flex-col gap-1 h-24 overflow-y-auto pr-1">
```

- [ ] **Step 2: Buat komponen grid**

Create `src/components/shared/order/order-grid.tsx`:
```tsx
"use client"

import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { VirtuosoGrid, type GridComponents } from "react-virtuoso"

type OrderGridContext = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasNextPageError: boolean
  onLoadNextPage: () => void
}

function OrderGridFooter({ context }: { context?: OrderGridContext }) {
  if (!context) return null

  if (context.hasNextPageError) {
    return (
      <div className="flex justify-center py-6">
        <button onClick={context.onLoadNextPage} className="text-sm text-primary underline">
          Coba muat lagi
        </button>
      </div>
    )
  }

  if (context.isFetchingNextPage) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memuat pesanan lain…
      </div>
    )
  }

  if (!context.hasNextPage) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Semua pesanan sudah ditampilkan</p>
  }

  return null
}

const ORDER_GRID_COMPONENTS: GridComponents<OrderGridContext> = { Footer: OrderGridFooter }

type Props = {
  orders: Order[]
  gridColumnsClass: string
  renderOrder: (order: Order) => React.ReactNode
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasNextPageError: boolean
  onLoadNextPage: () => void
}

export function OrderGrid({
  orders,
  gridColumnsClass,
  renderOrder,
  hasNextPage,
  isFetchingNextPage,
  hasNextPageError,
  onLoadNextPage,
}: Props) {
  const loadNextPageWhenAvailable = () => {
    if (hasNextPage && !isFetchingNextPage && !hasNextPageError) onLoadNextPage()
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      data={orders}
      computeItemKey={(_, order) => order.id}
      listClassName={`grid ${gridColumnsClass} gap-4`}
      itemContent={(_, order) => renderOrder(order)}
      endReached={loadNextPageWhenAvailable}
      context={{ hasNextPage, isFetchingNextPage, hasNextPageError, onLoadNextPage }}
      components={ORDER_GRID_COMPONENTS}
    />
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 8: Halaman pesanan kasir dan manager

**Files:**
- Modify: `src/components/shared/order/order-page.tsx`
- Modify: `src/components/shared/order/order-card.tsx`

**Interfaces:**
- Consumes: `useOrderList` (Task 6), `OrderGrid` (Task 7), `resolveOrderStatusFilter` (Task 2).
- Produces: `OrderCard` dengan props `{ order: Order }` (prop `onPaymentVerified` dihapus).

- [ ] **Step 1: Sederhanakan `OrderCard`**

Di `src/components/shared/order/order-card.tsx`, ganti:
```tsx
type Props = {
  order: Order
  onPaymentVerified?: () => void
}

export function OrderCard({ order, onPaymentVerified }: Props) {
```
dengan:
```tsx
export function OrderCard({ order }: { order: Order }) {
```
dan ganti:
```tsx
        <PaymentVerificationModal
          order={order}
          onClose={() => setIsPaymentModalOpen(false)}
          onVerified={() => {
            setIsPaymentModalOpen(false)
            onPaymentVerified?.()
          }}
        />
```
dengan:
```tsx
        <PaymentVerificationModal order={order} onClose={() => setIsPaymentModalOpen(false)} />
```

Prop `onVerified` di modal dihapus pada Task 10. Sampai Task 10 selesai, `tsc` akan melaporkan error di sini. Kerjakan Task 8 sampai Task 10 berurutan sebelum menjalankan `tsc`.

- [ ] **Step 2: Ganti isi `OrderPage`**

Replace `src/components/shared/order/order-page.tsx` seluruhnya:
```tsx
"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { useOrderList } from "@/hooks/queries/use-orders"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { resolveOrderStatusFilter } from "@/lib/order-list-page"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-status"
import { OrderStatus } from "@/types/order"
import { useState } from "react"
import { OrderCard } from "./order-card"
import { OrderGrid } from "./order-grid"

export type OrderStatusTab = {
  label: string
  status: OrderStatus | null
}

const DEFAULT_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
]

type Props = {
  statusTabs?: OrderStatusTab[]
}

export function OrderPage({ statusTabs = DEFAULT_STATUS_TABS }: Props) {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const { open: isSidebarOpen } = useSidebar()

  const orderList = useOrderList({
    statuses: resolveOrderStatusFilter(activeTabStatus, statusFilter),
    search: debouncedSearch,
  })

  const handleTabChange = (tabStatus: OrderStatus | null) => {
    setActiveTabStatus(tabStatus)
    setStatusFilter([])
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveTabStatus(null)
  }

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 lg:flex-2 order-2 lg:order-1 items-center gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.status)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                ${activeTabStatus === tab.status && statusFilter.length === 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-foreground/30 hover:border-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 lg:order-2 order-1 items-center gap-2">
          <FilterDropdown
            title="Status Pesanan"
            options={ORDER_STATUS_FILTER_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan ..." className="flex-1" />
        </div>
      </div>

      {orderList.isPending ? (
        <PageLoader />
      ) : orderList.isError ? (
        <LoadErrorState message="Gagal memuat data pesanan." onRetry={() => orderList.refetch()} />
      ) : orderList.orders.length > 0 ? (
        <OrderGrid
          orders={orderList.orders}
          gridColumnsClass={gridColumnsClass}
          renderOrder={(order) => <OrderCard order={order} />}
          hasNextPage={orderList.hasNextPage}
          isFetchingNextPage={orderList.isFetchingNextPage}
          hasNextPageError={orderList.isFetchNextPageError}
          onLoadNextPage={() => orderList.fetchNextPage()}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Tidak ada pesanan ditemukan.
        </div>
      )}
    </div>
  )
}
```

### Task 9: Halaman pesanan dapur

**Files:**
- Modify: `src/app/(private)/kitchen/order/page.tsx`
- Modify: `src/app/(private)/kitchen/order/components/kitchen-order-card.tsx`

**Interfaces:**
- Consumes: `useOrderList`, `KITCHEN_ORDER_POLL_INTERVAL_MS`, `useUpdateOrderStatus`, `useCancelOrder` (Task 6), `OrderGrid` (Task 7), `resolveOrderStatusFilter` (Task 2).
- Produces: `KitchenOrderCard` dengan props `{ order: Order }`.

- [ ] **Step 1: Kartu dapur memanggil mutasi sendiri**

Di `src/app/(private)/kitchen/order/components/kitchen-order-card.tsx`, ganti blok import dan awal komponen:
```tsx
import { OrderSummary } from "@/components/shared/order/order-summary"
import { getOrderPlace } from "@/lib/order-place"
import { canKitchenCancelOrder, getKitchenNextAction } from "@/lib/order-status"
import type { Order } from "@/types/order"
import { useState } from "react"
import { CancelOrderDialog } from "./cancel-order-dialog"
import { CompleteOrderDialog } from "./complete-order-dialog"
import { KitchenOrderDetailModal } from "./kitchen-order-detail-modal"

type Props = {
  order: Order
  onUpdateStatus: (orderId: number, nextStatus: number) => void
  onCancel: (orderId: number, reason: string) => Promise<boolean>
}

export function KitchenOrderCard({ order, onUpdateStatus, onCancel }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const status = Number(order.status)
  const nextAction = getKitchenNextAction(status)
  const canCancel = canKitchenCancelOrder(status)
  const placeName = getOrderPlace(order).name

  const handleAdvanceStatus = () => {
    if (!nextAction) return
    if (nextAction.requiresConfirmation) setIsCompleteDialogOpen(true)
    else onUpdateStatus(order.id, nextAction.nextStatus)
  }

  const handleConfirmComplete = () => {
    if (nextAction) onUpdateStatus(order.id, nextAction.nextStatus)
    setIsCompleteDialogOpen(false)
  }

  const handleConfirmCancel = async (reason: string) => {
    setIsCanceling(true)
    const isCanceled = await onCancel(order.id, reason)
    setIsCanceling(false)
    if (isCanceled) setIsCancelDialogOpen(false)
  }
```
dengan:
```tsx
import { OrderSummary } from "@/components/shared/order/order-summary"
import { useCancelOrder, useUpdateOrderStatus } from "@/hooks/queries/use-orders"
import { getApiErrorMessage } from "@/lib/api-error"
import { getOrderPlace } from "@/lib/order-place"
import { canKitchenCancelOrder, getKitchenNextAction } from "@/lib/order-status"
import type { Order } from "@/types/order"
import { useState } from "react"
import { toast } from "sonner"
import { CancelOrderDialog } from "./cancel-order-dialog"
import { CompleteOrderDialog } from "./complete-order-dialog"
import { KitchenOrderDetailModal } from "./kitchen-order-detail-modal"

export function KitchenOrderCard({ order }: { order: Order }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const updateOrderStatus = useUpdateOrderStatus()
  const cancelOrder = useCancelOrder()

  const status = Number(order.status)
  const nextAction = getKitchenNextAction(status)
  const canCancel = canKitchenCancelOrder(status)
  const placeName = getOrderPlace(order).name

  const moveToNextStatus = () => {
    if (!nextAction) return
    updateOrderStatus.mutate(
      { orderId: order.id, status: nextAction.nextStatus },
      { onError: () => toast.error("Gagal memperbarui status pesanan. Coba lagi.") },
    )
  }

  const handleAdvanceStatus = () => {
    if (!nextAction) return
    if (nextAction.requiresConfirmation) setIsCompleteDialogOpen(true)
    else moveToNextStatus()
  }

  const handleConfirmComplete = () => {
    moveToNextStatus()
    setIsCompleteDialogOpen(false)
  }

  const handleConfirmCancel = (reason: string) => {
    cancelOrder.mutate(
      { orderId: order.id, reason },
      {
        onSuccess: () => {
          toast.success("Pesanan berhasil dibatalkan.")
          setIsCancelDialogOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal membatalkan pesanan. Coba lagi.")),
      },
    )
  }
```
Lalu di JSX yang sama, ganti `isSubmitting={isCanceling}` menjadi `isSubmitting={cancelOrder.isPending}`.

- [ ] **Step 2: Ganti isi halaman dapur**

Replace `src/app/(private)/kitchen/order/page.tsx` seluruhnya:
```tsx
"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { OrderGrid } from "@/components/shared/order/order-grid"
import type { OrderStatusTab } from "@/components/shared/order/order-page"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useSidebar } from "@/components/ui/sidebar"
import { KITCHEN_ORDER_POLL_INTERVAL_MS, useOrderList } from "@/hooks/queries/use-orders"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { resolveOrderStatusFilter } from "@/lib/order-list-page"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-status"
import { OrderStatus } from "@/types/order"
import { useState } from "react"
import { KitchenOrderCard } from "./components/kitchen-order-card"

const KITCHEN_STATUS_TABS: OrderStatusTab[] = [
  { label: "Semua", status: null },
  { label: "Menunggu", status: OrderStatus.PENDING },
  { label: "Diproses", status: OrderStatus.PROCESSING },
  { label: "Siap", status: OrderStatus.READY },
  { label: "Selesai", status: OrderStatus.COMPLETED },
]

export default function KitchenOrderPage() {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const { open: isSidebarOpen } = useSidebar()

  const orderList = useOrderList(
    { statuses: resolveOrderStatusFilter(activeTabStatus, statusFilter), search: debouncedSearch },
    { pollIntervalMs: KITCHEN_ORDER_POLL_INTERVAL_MS },
  )

  const handleTabChange = (tabStatus: OrderStatus | null) => {
    setActiveTabStatus(tabStatus)
    setStatusFilter([])
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    if (statuses.length > 0) setActiveTabStatus(null)
  }

  const gridColumnsClass = isSidebarOpen
    ? "grid-cols-1 md:grid-cols-1 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {KITCHEN_STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.status)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors
                ${activeTabStatus === tab.status && statusFilter.length === 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-foreground/30 hover:border-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status Pesanan"
            options={ORDER_STATUS_FILTER_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={setSearch} placeholder="Cari pesanan ..." />
        </div>
      </div>

      {orderList.isPending ? (
        <PageLoader />
      ) : orderList.isError ? (
        <LoadErrorState message="Gagal memuat data pesanan." onRetry={() => orderList.refetch()} />
      ) : orderList.orders.length > 0 ? (
        <OrderGrid
          orders={orderList.orders}
          gridColumnsClass={gridColumnsClass}
          renderOrder={(order) => <KitchenOrderCard order={order} />}
          hasNextPage={orderList.hasNextPage}
          isFetchingNextPage={orderList.isFetchingNextPage}
          hasNextPageError={orderList.isFetchNextPageError}
          onLoadNextPage={() => orderList.fetchNextPage()}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Tidak ada pesanan ditemukan.
        </div>
      )}
    </div>
  )
}
```

### Task 10: Modal verifikasi pembayaran dan dashboard kasir

**Files:**
- Modify: `src/components/shared/order/payment-verification-modal.tsx`
- Modify: `src/app/(private)/cashier/dashboard/page.tsx`
- Modify: `src/app/(private)/cashier/dashboard/components/active-order-list.tsx`
- Modify: `src/app/(private)/cashier/dashboard/components/pending-payment-list.tsx`

**Interfaces:**
- Consumes: `usePaymentForOrder`, `useVerifyCashPayment`, `useRefreshOrderData`, `useCashierStats`, `useCashierActiveOrders`, `useCashierPendingPayments` (Task 6).
- Produces: `PaymentVerificationModal` dengan props `{ order: Order; onClose: () => void }`. `ActiveOrderList` dan `PendingPaymentList` tanpa props.

- [ ] **Step 1: Modal memakai query dan mutation**

Di `src/components/shared/order/payment-verification-modal.tsx`:

Ganti baris import:
```ts
import { paymentService } from "@/services/payment.service"
```
dengan:
```ts
import { usePaymentForOrder, useVerifyCashPayment } from "@/hooks/queries/use-payments"
import { useRefreshOrderData } from "@/hooks/queries/use-orders"
```
dan ganti:
```ts
import { Fragment, useEffect, useState } from "react"
```
dengan:
```ts
import { Fragment, useState } from "react"
```
Import `CashPaymentResult` dari `@/types/payment` tetap dipertahankan karena `CashPaymentSuccess` masih memakainya.

Ganti seluruh blok dari `type Props = {` sampai akhir fungsi `handleClose` (termasuk state, `useEffect`, `handleRetryLoadPayment`, `handleCashPayment`, dan `handleClose`) dengan:
```tsx
type Props = {
  order: Order
  onClose: () => void
}

export function PaymentVerificationModal({ order, onClose }: Props) {
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod>("cash")
  const paymentQuery = usePaymentForOrder(order.id)
  const verifyCashPayment = useVerifyCashPayment()
  const refreshOrderData = useRefreshOrderData()

  const place = getOrderPlace(order)
  const items = order.items ?? []
  const totalAmount = Number(order.total_price)

  const payment = paymentQuery.data ?? null
  const isLoadingPayment = paymentQuery.isPending
  const hasPaymentLoadError = paymentQuery.isError
  const isMethodLocked = payment !== null
  const selectedMethod: PaymentMethod = payment
    ? payment.type === PaymentType.ONLINE ? "online" : "cash"
    : chosenMethod
  const cashPaymentResult = verifyCashPayment.data ?? null
  const isVerifyingCash = verifyCashPayment.isPending
  const cashVerificationError = verifyCashPayment.isError
    ? getApiErrorMessage(verifyCashPayment.error, "Gagal verifikasi pembayaran. Coba lagi.")
    : null

  const handleRetryLoadPayment = () => paymentQuery.refetch()

  const handleCashPayment = (receivedAmount: number) =>
    verifyCashPayment.mutate({ orderId: order.id, receivedAmount })

  const handleClose = () => {
    if (cashPaymentResult) refreshOrderData()
    onClose()
  }
```
Lalu di JSX `Select` metode pembayaran, ganti:
```tsx
              onValueChange={(method) => setSelectedMethod(method as PaymentMethod)}
```
dengan:
```tsx
              onValueChange={(method) => setChosenMethod(method as PaymentMethod)}
```

- [ ] **Step 2: Daftar pesanan aktif**

Di `src/app/(private)/cashier/dashboard/components/active-order-list.tsx`, ganti import:
```ts
import { dashboardService } from "@/services/dashboard.service"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
```
dengan:
```ts
import { useCashierActiveOrders } from "@/hooks/queries/use-dashboard"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
```
Ganti fungsi `ActiveOrderList` seluruhnya:
```tsx
export function ActiveOrderList() {
  const activeOrdersQuery = useCashierActiveOrders()
  const orders = activeOrdersQuery.data ?? []

  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pesanan Aktif</h4>
      {activeOrdersQuery.isPending ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pesanan aktif.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <ActiveOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Daftar pembayaran tertunda**

Replace `src/app/(private)/cashier/dashboard/components/pending-payment-list.tsx` seluruhnya:
```tsx
"use client"

import { PaymentVerificationModal } from "@/components/shared/order/payment-verification-modal"
import { useCashierPendingPayments } from "@/hooks/queries/use-dashboard"
import { getOrderPlace } from "@/lib/order-place"
import type { Order } from "@/types/order"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

function PendingPaymentRow({ order }: { order: Order }) {
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  const place = getOrderPlace(order)

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="bg-secondary text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center">
          {place.code}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{place.name}</p>
          <p className="text-xs text-muted-foreground">Order #{order.id}</p>
        </div>
        <button
          onClick={() => setIsVerificationOpen(true)}
          className="bg-secondary text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Verifikasi
        </button>
      </div>

      {isVerificationOpen && (
        <PaymentVerificationModal order={order} onClose={() => setIsVerificationOpen(false)} />
      )}
    </>
  )
}

export function PendingPaymentList() {
  const pendingPaymentsQuery = useCashierPendingPayments()
  const orders = pendingPaymentsQuery.data ?? []

  return (
    <div className="bg-white border border-foreground/40 rounded-lg p-4 flex flex-col gap-4">
      <h4 className="font-bold text-xl">Pembayaran</h4>
      {pendingPaymentsQuery.isPending ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pembayaran yang menunggu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <PendingPaymentRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Halaman dashboard kasir**

Di `src/app/(private)/cashier/dashboard/page.tsx`, ganti blok import dan isi fungsi sampai sebelum `return (` dengan:
```tsx
"use client"

import { PageLoader } from "@/components/shared/page-state"
import { useCashierStats } from "@/hooks/queries/use-dashboard"
import type { CashierDashboardStats } from "@/types/dashboard"
import { BellRingingIcon } from "@/components/icons/bell-ringing"
import { ReceiptItemIcon } from "@/components/icons/receipt-item"
import { TimerIcon } from "@/components/icons/timer"
import { useEffect } from "react"
import { toast } from "sonner"
import { ActiveOrderList } from "./components/active-order-list"
import { CashierStatCard } from "./components/cashier-stat-card"
import { PendingPaymentList } from "./components/pending-payment-list"

const EMPTY_STATS: CashierDashboardStats = { newOrders: 0, processingOrders: 0, totalOrders: 0 }

export default function CashierDashboardPage() {
  const statsQuery = useCashierStats()
  const stats = statsQuery.data ?? EMPTY_STATS

  useEffect(() => {
    if (statsQuery.isError) toast.error("Gagal memuat statistik dashboard.")
  }, [statsQuery.isError])

  if (statsQuery.isPending) return <PageLoader />
```
Lalu di JSX, ganti:
```tsx
        <ActiveOrderList refreshKey={listRefreshKey} />
        <PendingPaymentList refreshKey={listRefreshKey} onPaymentVerified={handlePaymentVerified} />
```
dengan:
```tsx
        <ActiveOrderList />
        <PendingPaymentList />
```

- [ ] **Step 5: Type-check dan lint**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error. Kalau ESLint melaporkan `react-hooks/set-state-in-effect` di dashboard, tidak berlaku di sini karena effect hanya memanggil `toast`.

### Task 11: Polling status pesanan pelanggan

**Files:**
- Modify: `src/app/(public)/payment/status/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `useOrderDetail(orderId, { pollUntilFinal: true })` (Task 6).

- [ ] **Step 1: Ganti logika pengambilan data**

Ganti import:
```ts
import { orderService } from "@/services/order.service"
import { OrderStatus, type Order } from "@/types/order"
```
dengan:
```ts
import { useOrderDetail } from "@/hooks/queries/use-orders"
import { OrderStatus } from "@/types/order"
```
dan ganti:
```ts
import { useCallback, useEffect, useState } from "react"

const POLL_INTERVAL_MS = 8000
```
dengan baris kosong (hapus keduanya).

Ganti blok dari `const [order, setOrder] = useState<Order | null>(null)` sampai akhir `useEffect` polling (sebelum `const invoiceLink = (`):
```tsx
  const [order, setOrder] = useState<Order | null>(null)
  ...
  }, [orderId, isFinalStatus, fetchOrder])
```
dengan:
```tsx
  const orderQuery = useOrderDetail(orderId, { pollUntilFinal: true })
  const order = orderQuery.data ?? null
  const isValidOrderId = Number.isInteger(orderId) && orderId > 0
  const isLoading = isValidOrderId && orderQuery.isPending
  const error = !isValidOrderId
    ? "Nomor pesanan tidak valid"
    : orderQuery.isError && !order
      ? orderQuery.error instanceof Error ? orderQuery.error.message : "Gagal memuat status pesanan"
      : null

  const status = order ? Number(order.status) : null
  const isCanceled = status === OrderStatus.CANCELED
  const isFinalStatus = status === OrderStatus.COMPLETED || isCanceled
  const canPrintInvoice = order ? canViewInvoice(order) : false
  const currentStepIndex = ORDER_PROGRESS_STEPS.findIndex((step) => step.status === status)
```

- [ ] **Step 2: Type-check, lint, dan build**

Run: `npm test && npx tsc --noEmit -p . && npx eslint src && npx next build`
Expected: semua PASS.

### Checkpoint Tahap 2

- [ ] Tes manual di browser:
  1. `/manager/order` dengan lebih dari 20 pesanan: scroll sampai bawah, pastikan kartu 21 dan seterusnya dimuat dan muncul teks "Semua pesanan sudah ditampilkan".
  2. Ganti tab di tengah scroll: daftar mulai lagi dari atas sesuai filter.
  3. Cari nama pelanggan di `/kitchen/order`: hasilnya sesuai.
  4. Ubah status pesanan di dapur, lalu buka `/cashier/order` dan dashboard kasir: data sudah berubah tanpa reload.
  5. Sembunyikan tab dapur lebih dari 10 detik (pindah tab browser), lalu buka devtools Network: tidak ada request `/orders` selama tab tersembunyi.
  6. **Review Focus 1:** di dashboard kasir, verifikasi pembayaran tunai. Modal tetap terbuka dan menampilkan kembalian. Setelah ditutup, pesanan hilang dari daftar pembayaran.
  7. Halaman `/payment/status/<id>`: status berubah sendiri saat dapur memproses, dan polling berhenti saat status Selesai.
- [ ] Berhenti. Serahkan pesan commit kepada pengguna:
```
feat(client): infinite scroll orders with TanStack Query and Virtuoso

- Load cashier, manager and kitchen orders 20 at a time with VirtuosoGrid
- Poll kitchen orders and customer order status via refetchInterval
- Replace refresh callbacks with query invalidation after mutations
- Keep the payment modal open until the cashier closes it

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

# Tahap 3 — Tabel

### Task 12: `DataTable`, pilihan jumlah baris, dan state pagination

**Files:**
- Create: `src/hooks/use-pagination-state.ts`
- Create: `src/components/shared/data-table.tsx`
- Modify: `src/components/shared/table-pagination.tsx`

**Interfaces:**
- Consumes: `getPaginationView` (Task 1).
- Produces:
  - `PAGE_SIZE_OPTIONS = [10, 25, 50, 100]`, `usePaginationState(): { requestedPage: number; pageSize: number; setRequestedPage: (page: number) => void; setPageSize: (pageSize: number) => void; resetToFirstPage: () => void }`
  - `DataTableColumn<Row>`: `{ header: string; align?: "left" | "center" | "right"; headerClassName?: string; cellClassName?: string; render: (row: Row) => React.ReactNode }`
  - `DataTable<Row>` dengan props `{ columns: DataTableColumn<Row>[]; rows: Row[]; getRowKey: (row: Row) => React.Key; emptyMessage: string; currentPage: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void; isRefreshing?: boolean }`. `rows` adalah baris halaman yang sedang tampil.

- [ ] **Step 1: Hook state pagination**

Create `src/hooks/use-pagination-state.ts`:
```ts
import { useState } from "react"

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 10

export function usePaginationState() {
  const [requestedPage, setRequestedPage] = useState(1)
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE)

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize)
    setRequestedPage(1)
  }

  return {
    requestedPage,
    pageSize,
    setRequestedPage,
    setPageSize,
    resetToFirstPage: () => setRequestedPage(1),
  }
}
```

- [ ] **Step 2: Pilihan jumlah baris**

Di `src/components/shared/table-pagination.tsx`, tambahkan di awal file:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination-state"
```
dan tambahkan di akhir file:
```tsx
type PageSizeSelectProps = {
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
}

export function PageSizeSelect({ pageSize, onPageSizeChange }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
      <span>Tampilkan</span>
      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
        <SelectTrigger className="h-8 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>baris</span>
    </div>
  )
}
```

- [ ] **Step 3: Komponen `DataTable`**

Create `src/components/shared/data-table.tsx`:
```tsx
"use client"

import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { TableVirtuoso } from "react-virtuoso"
import { PageSizeSelect, TablePagination } from "./table-pagination"

const VIRTUALIZATION_ROW_THRESHOLD = 10
const VIRTUALIZED_TABLE_HEIGHT_PX = 560
const TABLE_CLASS =
  "w-full min-w-3xl text-sm [&_tbody_tr]:border-b [&_tbody_tr]:border-foreground/5 [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-muted/30"

type ColumnAlign = "left" | "center" | "right"

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export type DataTableColumn<Row> = {
  header: string
  align?: ColumnAlign
  headerClassName?: string
  cellClassName?: string
  render: (row: Row) => React.ReactNode
}

type Props<Row> = {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => React.Key
  emptyMessage: string
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isRefreshing?: boolean
}

function VirtualizedTable({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <table style={style} className={TABLE_CLASS}>
      {children}
    </table>
  )
}

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isRefreshing = false,
}: Props<Row>) {
  const rowNumberOffset = (currentPage - 1) * pageSize

  const headerCells = (
    <>
      <th className="text-left px-6 py-4 font-semibold w-16 bg-white">No.</th>
      {columns.map((column) => (
        <th
          key={column.header}
          className={cn("px-6 py-4 font-semibold bg-white", ALIGN_CLASS[column.align ?? "left"], column.headerClassName)}
        >
          {column.header}
        </th>
      ))}
    </>
  )

  const renderCells = (row: Row, rowIndex: number) => (
    <>
      <td className="px-6 py-4 text-muted-foreground">{rowNumberOffset + rowIndex + 1}.</td>
      {columns.map((column) => (
        <td key={column.header} className={cn("px-6 py-4", ALIGN_CLASS[column.align ?? "left"], column.cellClassName)}>
          {column.render(row)}
        </td>
      ))}
    </>
  )

  return (
    <>
      <div className="bg-white rounded-xl border border-foreground/10 overflow-x-auto">
        {rows.length > VIRTUALIZATION_ROW_THRESHOLD ? (
          <TableVirtuoso
            style={{ height: VIRTUALIZED_TABLE_HEIGHT_PX }}
            data={rows}
            computeItemKey={(_, row) => getRowKey(row)}
            components={{ Table: VirtualizedTable }}
            fixedHeaderContent={() => <tr className="border-b border-foreground/10">{headerCells}</tr>}
            itemContent={(rowIndex, row) => renderCells(row, rowIndex)}
          />
        ) : (
          <table className={TABLE_CLASS}>
            <thead>
              <tr className="border-b border-foreground/10">{headerCells}</tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => <tr key={getRowKey(row)}>{renderCells(row, rowIndex)}</tr>)
              )}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <PageSizeSelect pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
            {isRefreshing && <Loader2Icon className="size-4 mt-2 animate-spin text-muted-foreground" />}
          </div>
          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Type-check dan lint**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 13: Stok dan satuan

**Files:**
- Modify: `src/lib/stock.ts`
- Test: `src/lib/stock.test.ts`
- Create: `src/hooks/queries/use-stocks.ts`
- Create: `src/hooks/queries/use-units.ts`
- Modify: `src/components/shared/stock/stock-list-view.tsx`
- Modify: `src/components/shared/stock/stock-table.tsx`
- Modify: `src/components/shared/stock/stock-detail-view.tsx`
- Modify: `src/components/shared/stock/stock-edit-view.tsx`
- Modify: `src/components/shared/stock/stock-create-view.tsx`
- Modify: `src/components/shared/stock/stock-form.tsx`

**Interfaces:**
- Consumes: `queryKeys`, `StockListFilters` (Task 4), `DataTable`, `usePaginationState` (Task 12), `getPaginationView` (Task 1).
- Produces:
  - `toStockListQuery(filters: StockListFilters): Record<string, string>` di `@/lib/stock`
  - `useStockList(filters: StockListFilters)`, `useStockDetail(stockId: number)`, `useCreateStock()`, `useUpdateStock()` dengan variabel `{ stockId: number; request: CreateStockRequest }`, `useDeleteStock()` dengan variabel `stockId: number`
  - `useUnitList()`, `useSaveUnit()` dengan variabel `{ unitId: number | null; request: CreateUnitRequest }`, `useDeleteUnit()` dengan variabel `unitId: number`
  - `StockTable` dengan props `{ stocks: Stock[]; basePath: string; currentPage: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void; isRefreshing: boolean; onStockDeleted: () => void }`

- [ ] **Step 1: Tulis test query stok yang gagal**

Create `src/lib/stock.test.ts`:
```ts
import { StockStatus } from "@/types/stock"
import { describe, expect, it } from "vitest"
import { toStockListQuery } from "./stock"

const baseFilters = { search: "", statuses: [], page: 2, pageSize: 25 }

describe("toStockListQuery", () => {
  it("sends paging and newest-first ordering", () => {
    expect(toStockListQuery(baseFilters)).toEqual({
      page: "2",
      limit: "25",
      order_by: "created_at",
      direction: "DESC",
    })
  })

  it("sends the trimmed search text", () => {
    expect(toStockListQuery({ ...baseFilters, search: "  gula " }).q).toBe("gula")
  })

  it("sends a single status as a plain number", () => {
    expect(toStockListQuery({ ...baseFilters, statuses: [StockStatus.LOW_STOCK] }).status).toBe("2")
  })

  it("sends several statuses as a JSON array", () => {
    const query = toStockListQuery({ ...baseFilters, statuses: [StockStatus.IN_STOCK, StockStatus.LOW_STOCK] })
    expect(query.status).toBe("[1,2]")
  })
})
```

Run: `npm test`
Expected: FAIL, `toStockListQuery is not a function`.

- [ ] **Step 2: Implementasi `toStockListQuery`**

Di `src/lib/stock.ts`, ubah import pertama dan tambahkan fungsi di akhir file:
```ts
import type { StockListFilters } from "@/lib/query-keys"
import type { CreateStockRequest, Stock } from "@/types/stock"
```
```ts
export function toStockListQuery({ search, statuses, page, pageSize }: StockListFilters) {
  const query: Record<string, string> = {
    page: String(page),
    limit: String(pageSize),
    order_by: "created_at",
    direction: "DESC",
  }
  if (search.trim()) query.q = search.trim()
  if (statuses.length === 1) query.status = String(statuses[0])
  else if (statuses.length > 1) query.status = JSON.stringify(statuses)
  return query
}
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Hook stok dan satuan**

Create `src/hooks/queries/use-stocks.ts`:
```ts
import { queryKeys, type StockListFilters } from "@/lib/query-keys"
import { toStockListQuery } from "@/lib/stock"
import { stockService } from "@/services/stock.service"
import type { CreateStockRequest } from "@/types/stock"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useStockList(filters: StockListFilters) {
  return useQuery({
    queryKey: queryKeys.stocks.list(filters),
    queryFn: () => stockService.getAll(toStockListQuery(filters)),
    placeholderData: keepPreviousData,
  })
}

export function useStockDetail(stockId: number) {
  return useQuery({
    queryKey: queryKeys.stocks.detail(stockId),
    queryFn: () => stockService.getById(stockId),
  })
}

function useInvalidateStocks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all })
}

export function useCreateStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: (request: CreateStockRequest) => stockService.create(request),
    onSuccess: invalidateStocks,
  })
}

export function useUpdateStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: ({ stockId, request }: { stockId: number; request: CreateStockRequest }) =>
      stockService.update(stockId, request),
    onSuccess: invalidateStocks,
  })
}

export function useDeleteStock() {
  const invalidateStocks = useInvalidateStocks()
  return useMutation({
    mutationFn: (stockId: number) => stockService.remove(stockId),
    onSuccess: invalidateStocks,
  })
}
```

Create `src/hooks/queries/use-units.ts`:
```ts
import { queryKeys } from "@/lib/query-keys"
import { unitService } from "@/services/unit.service"
import type { CreateUnitRequest } from "@/types/unit"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useUnitList() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: () => unitService.getAll({ order_by: "created_at", direction: "DESC" }),
  })
}

function useInvalidateUnits() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
}

export function useSaveUnit() {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: ({ unitId, request }: { unitId: number | null; request: CreateUnitRequest }) =>
      unitId === null ? unitService.create(request) : unitService.update(unitId, request),
    onSuccess: invalidateUnits,
  })
}

export function useDeleteUnit() {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (unitId: number) => unitService.remove(unitId),
    onSuccess: invalidateUnits,
  })
}
```

- [ ] **Step 4: Tabel stok memakai `DataTable`**

Replace `src/components/shared/stock/stock-table.tsx` seluruhnya:
```tsx
"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteStock } from "@/hooks/queries/use-stocks"
import { getStockName } from "@/lib/stock"
import { getStockStatusDisplay } from "@/lib/stock-status"
import type { Stock } from "@/types/stock"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  stocks: Stock[]
  basePath: string
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isRefreshing: boolean
  onStockDeleted: () => void
}

export function StockTable({ stocks, basePath, onStockDeleted, ...pagination }: Props) {
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null)
  const deleteStock = useDeleteStock()

  const handleConfirmDelete = () => {
    if (!stockToDelete) return
    deleteStock.mutate(stockToDelete.id, {
      onSuccess: () => {
        toast.success("Bahan berhasil dihapus.")
        setStockToDelete(null)
        onStockDeleted()
      },
      onError: () => toast.error("Gagal menghapus bahan. Coba lagi."),
    })
  }

  const columns: DataTableColumn<Stock>[] = [
    { header: "Nama Bahan", cellClassName: "font-medium", render: getStockName },
    { header: "Jumlah Bahan", align: "center", cellClassName: "text-muted-foreground", render: (stock) => stock.quantity },
    {
      header: "Status",
      align: "center",
      render: (stock) => {
        const statusDisplay = getStockStatusDisplay(stock.status, stock.status_name)
        return <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
      },
    },
    {
      header: "Aksi",
      align: "center",
      render: (stock) => (
        <RowActionsMenu
          detailHref={`${basePath}/${stock.id}`}
          editHref={`${basePath}/${stock.id}/edit`}
          onDelete={() => setStockToDelete(stock)}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={stocks}
        getRowKey={(stock) => stock.id}
        emptyMessage="Bahan tidak ditemukan."
        {...pagination}
      />

      {stockToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus bahan ${getStockName(stockToDelete)}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={deleteStock.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setStockToDelete(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 5: Daftar stok**

Replace `src/components/shared/stock/stock-list-view.tsx` seluruhnya:
```tsx
"use client"

import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { StockTable } from "@/components/shared/stock/stock-table"
import { useStockList } from "@/hooks/queries/use-stocks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView } from "@/lib/pagination"
import { STOCK_STATUS_OPTIONS } from "@/lib/stock-status"
import { BoxIcon } from "@/components/icons/box"
import Link from "next/link"
import { useState } from "react"

export function StockListView({ basePath }: { basePath: string }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const stockListQuery = useStockList({
    search: debouncedSearch,
    statuses: statusFilter,
    page: pagination.requestedPage,
    pageSize: pagination.pageSize,
  })
  const stocks = stockListQuery.data?.stocks ?? []
  const { currentPage, totalPages } = getPaginationView(
    pagination.requestedPage,
    pagination.pageSize,
    stockListQuery.data?.count ?? 0,
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    pagination.resetToFirstPage()
  }

  const handleStockDeleted = () => {
    const wasLastRowOnPage = stocks.length === 1 && pagination.requestedPage > 1
    if (wasLastRowOnPage) pagination.setRequestedPage(pagination.requestedPage - 1)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${basePath}/create`}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <BoxIcon className="size-4" />
          Tambah Bahan
        </Link>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status"
            options={STOCK_STATUS_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari bahan ..." />
        </div>
      </div>

      {stockListQuery.isPending ? (
        <PageLoader />
      ) : stockListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data bahan." onRetry={() => stockListQuery.refetch()} />
      ) : (
        <StockTable
          stocks={stocks}
          basePath={basePath}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
          isRefreshing={stockListQuery.isPlaceholderData}
          onStockDeleted={handleStockDeleted}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Form, detail, edit, dan tambah stok**

Di `src/components/shared/stock/stock-form.tsx`, ganti import:
```ts
import { unitService } from "@/services/unit.service"
import type { Unit } from "@/types/unit"
import { BoxIcon, CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
```
dengan:
```ts
import { useUnitList } from "@/hooks/queries/use-units"
import { BoxIcon, CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
```
dan ganti:
```ts
  const [units, setUnits] = useState<Unit[]>([])
  const [isUnitPickerOpen, setIsUnitPickerOpen] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)
  const [values, setValues] = useState<StockFormValues>(initialValues)
  const [errors, setErrors] = useState<StockFormErrors>({})

  useEffect(() => {
    unitService.getAll()
      .then(setUnits)
      .catch(() => toast.error("Gagal memuat daftar satuan."))
      .finally(() => setIsLoadingUnits(false))
  }, [])
```
dengan:
```ts
  const unitListQuery = useUnitList()
  const units = unitListQuery.data ?? []
  const isLoadingUnits = unitListQuery.isPending
  const [isUnitPickerOpen, setIsUnitPickerOpen] = useState(false)
  const [values, setValues] = useState<StockFormValues>(initialValues)
  const [errors, setErrors] = useState<StockFormErrors>({})

  useEffect(() => {
    if (unitListQuery.isError) toast.error("Gagal memuat daftar satuan.")
  }, [unitListQuery.isError])
```

Di `src/components/shared/stock/stock-detail-view.tsx`, ganti import:
```ts
import { stockService } from "@/services/stock.service"
import { unitService } from "@/services/unit.service"
import type { Stock } from "@/types/stock"
import type { Unit } from "@/types/unit"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
```
dengan:
```ts
import { useStockDetail } from "@/hooks/queries/use-stocks"
import { useUnitList } from "@/hooks/queries/use-units"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
```
dan ganti blok state serta pengambilan data di awal `StockDetailView` sampai `if (isLoading) return <PageLoader />`:
```tsx
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  ...
  if (isLoading) return <PageLoader />

  if (error || !stock) {
    return (
      <LoadErrorState
        message={error ?? "Data tidak ditemukan."}
```
dengan:
```tsx
  const router = useRouter()
  const stockQuery = useStockDetail(stockId)
  const unitListQuery = useUnitList()
  const stock = stockQuery.data
  const units = unitListQuery.data ?? []

  if (stockQuery.isPending) return <PageLoader />

  if (stockQuery.isError || !stock) {
    return (
      <LoadErrorState
        message="Gagal memuat data bahan."
```

Replace `src/components/shared/stock/stock-edit-view.tsx` seluruhnya:
```tsx
"use client"

import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { StockForm } from "@/components/shared/stock/stock-form"
import { useStockDetail, useUpdateStock } from "@/hooks/queries/use-stocks"
import { toStockFormValues, toStockRequest, type StockFormValues } from "@/lib/stock"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  stockId: number
  basePath: string
}

export function StockEditView({ stockId, basePath }: Props) {
  const router = useRouter()
  const stockQuery = useStockDetail(stockId)
  const updateStock = useUpdateStock()
  const detailPath = `${basePath}/${stockId}`

  const handleSubmit = async (values: StockFormValues) => {
    try {
      await updateStock.mutateAsync({ stockId, request: toStockRequest(values) })
      toast.success("Perubahan bahan berhasil disimpan.")
      router.push(detailPath)
    } catch {
      toast.error("Gagal menyimpan perubahan. Silakan coba lagi.")
    }
  }

  if (stockQuery.isPending) return <PageLoader />

  if (!stockQuery.data) {
    return (
      <LoadErrorState message="Gagal memuat data bahan." retryLabel="Kembali" onRetry={() => router.push(basePath)} />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 pt-0">
        <BackLink href={detailPath} />
      </div>
      <StockForm
        initialValues={toStockFormValues(stockQuery.data)}
        isSubmitting={updateStock.isPending}
        submitLabel="Simpan Perubahan"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
```

Replace `src/components/shared/stock/stock-create-view.tsx` seluruhnya:
```tsx
"use client"

import { StockForm } from "@/components/shared/stock/stock-form"
import { useCreateStock } from "@/hooks/queries/use-stocks"
import { toStockRequest, type StockFormValues } from "@/lib/stock"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function StockCreateView({ basePath }: { basePath: string }) {
  const router = useRouter()
  const createStock = useCreateStock()

  const handleSubmit = async (values: StockFormValues) => {
    try {
      await createStock.mutateAsync(toStockRequest(values))
      toast.success("Bahan berhasil ditambahkan.")
      router.push(basePath)
    } catch {
      toast.error("Gagal menambahkan bahan. Silakan coba lagi.")
    }
  }

  return <StockForm onSubmit={handleSubmit} isSubmitting={createStock.isPending} />
}
```

- [ ] **Step 7: Verifikasi**

Run: `npm test && npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 14: Menu

**Files:**
- Create: `src/hooks/queries/use-menus.ts`
- Modify: `src/app/(private)/manager/menu/page.tsx`
- Modify: `src/components/manager/menu/menu-table.tsx`
- Modify: `src/app/(private)/manager/menu/[id]/page.tsx`
- Modify: `src/app/(private)/manager/menu/[id]/edit/page.tsx`
- Modify: `src/app/(private)/manager/menu/create/page.tsx`

**Interfaces:**
- Consumes: `queryKeys`, `MenuListFilters` (Task 4), `DataTable`, `usePaginationState` (Task 12), `getPaginationView`, `paginate` (Task 1).
- Produces: `useMenuList(filters: MenuListFilters)`, `useMenuDetail(menuId: number)`, `useCreateMenu()` dengan variabel `FormData`, `useUpdateMenu()` dengan variabel `{ menuId: number; formData: FormData }`, `useDeleteMenu()` dengan variabel `menuId: number`. `MenuTable` dengan props `{ menus: Menu[]; currentPage: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }` (`menus` adalah baris halaman yang tampil).

- [ ] **Step 1: Hook menu**

Create `src/hooks/queries/use-menus.ts`:
```ts
import { queryKeys, type MenuListFilters } from "@/lib/query-keys"
import { menuService } from "@/services/menu.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useMenuList(filters: MenuListFilters) {
  return useQuery({
    queryKey: queryKeys.menus.list(filters),
    queryFn: () =>
      menuService.getAll({
        q: filters.search || undefined,
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      }),
  })
}

export function useMenuDetail(menuId: number) {
  return useQuery({
    queryKey: queryKeys.menus.detail(menuId),
    queryFn: () => menuService.getById(menuId),
  })
}

function useInvalidateMenus() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.menus.all })
}

export function useCreateMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: (formData: FormData) => menuService.create(formData),
    onSuccess: invalidateMenus,
  })
}

export function useUpdateMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: ({ menuId, formData }: { menuId: number; formData: FormData }) => menuService.update(menuId, formData),
    onSuccess: invalidateMenus,
  })
}

export function useDeleteMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: (menuId: number) => menuService.remove(menuId),
    onSuccess: invalidateMenus,
  })
}
```

- [ ] **Step 2: Tabel menu**

Replace `src/components/manager/menu/menu-table.tsx` seluruhnya:
```tsx
"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteMenu } from "@/hooks/queries/use-menus"
import { formatRupiah } from "@/lib/format"
import { getMenuStatusDisplay } from "@/lib/menu-status"
import type { Menu } from "@/types/menu"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  menus: Menu[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const MENU_COLUMNS: DataTableColumn<Menu>[] = [
  { header: "Nama Menu", cellClassName: "font-medium", render: (menu) => menu.name },
  { header: "Harga", align: "center", cellClassName: "text-muted-foreground", render: (menu) => formatRupiah(menu.price) },
  {
    header: "Status",
    align: "center",
    render: (menu) => {
      const statusDisplay = getMenuStatusDisplay(menu.status, menu.status_name)
      return <StatusBadge label={statusDisplay.label} tone={statusDisplay.tone} />
    },
  },
]

export function MenuTable({ menus, ...pagination }: Props) {
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const deleteMenu = useDeleteMenu()

  const handleConfirmDelete = () => {
    if (!menuToDelete) return
    deleteMenu.mutate(menuToDelete.id, {
      onSuccess: () => {
        toast.success("Menu berhasil dihapus.")
        setMenuToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus menu. Coba lagi."),
    })
  }

  const columns: DataTableColumn<Menu>[] = [
    ...MENU_COLUMNS,
    {
      header: "Aksi",
      align: "center",
      render: (menu) => (
        <RowActionsMenu
          detailHref={`/manager/menu/${menu.id}`}
          editHref={`/manager/menu/${menu.id}/edit`}
          onDelete={() => setMenuToDelete(menu)}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={menus}
        getRowKey={(menu) => menu.id}
        emptyMessage="Menu tidak ditemukan."
        {...pagination}
      />

      {menuToDelete && (
        <ConfirmDeleteDialog
          title={`Hapus menu ${menuToDelete.name}?`}
          description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda benar-benar ingin melanjutkan tindakan ini."
          isDeleting={deleteMenu.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setMenuToDelete(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Halaman daftar menu**

Replace `src/app/(private)/manager/menu/page.tsx` seluruhnya:
```tsx
"use client"

import { MenuTable } from "@/components/manager/menu/menu-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useMenuList } from "@/hooks/queries/use-menus"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { MENU_STATUS_OPTIONS } from "@/lib/menu-status"
import { getPaginationView, paginate } from "@/lib/pagination"
import { CirclePlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ManagerMenuListPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const menuListQuery = useMenuList({ search: debouncedSearch, statuses: statusFilter })
  const menus = menuListQuery.data ?? []
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, menus.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleStatusFilterApply = (statuses: number[]) => {
    setStatusFilter(statuses)
    pagination.resetToFirstPage()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/manager/menu/create"
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <CirclePlusIcon className="size-4" />
          Tambah Menu
        </Link>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Status"
            options={MENU_STATUS_OPTIONS}
            selectedValues={statusFilter}
            onApply={handleStatusFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari menu ..." />
        </div>
      </div>

      {menuListQuery.isPending ? (
        <PageLoader />
      ) : menuListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data menu." onRetry={() => menuListQuery.refetch()} />
      ) : (
        <MenuTable
          menus={paginate(menus, currentPage, pagination.pageSize)}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Detail, edit, dan tambah menu**

Di `src/app/(private)/manager/menu/[id]/page.tsx`, ganti import:
```ts
import { menuService } from "@/services/menu.service"
import type { Menu } from "@/types/menu"
```
dengan:
```ts
import { useMenuDetail } from "@/hooks/queries/use-menus"
```
dan `import { use, useEffect, useState } from "react"` menjadi `import { use } from "react"`. Ganti:
```tsx
  const [menu, setMenu] = useState<Menu | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    menuService.getById(menuId)
      .then(setMenu)
      .catch(() => setMenu(null))
      .finally(() => setIsLoading(false))
  }, [menuId])

  if (isLoading) return <PageLoader />
```
dengan:
```tsx
  const menuQuery = useMenuDetail(menuId)
  const menu = menuQuery.data

  if (menuQuery.isPending) return <PageLoader />
```

Replace `src/app/(private)/manager/menu/[id]/edit/page.tsx` seluruhnya:
```tsx
"use client"

import { MenuForm } from "@/components/manager/menu/menu-form"
import { BackLink } from "@/components/shared/back-link"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { useMenuDetail, useUpdateMenu } from "@/hooks/queries/use-menus"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { useRouter } from "next/navigation"
import { use } from "react"
import { toast } from "sonner"

export default function ManagerMenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const menuId = Number(use(params).id)
  const router = useRouter()
  const menuQuery = useMenuDetail(menuId)
  const updateMenu = useUpdateMenu()

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await updateMenu.mutateAsync({ menuId, formData: toMenuFormData(values, { includeStatus: true }) })
      toast.success("Menu berhasil diperbarui.")
      router.push(`/manager/menu/${menuId}`)
    } catch {
      toast.error("Gagal memperbarui menu. Silakan coba lagi.")
    }
  }

  if (menuQuery.isPending) return <PageLoader />

  if (!menuQuery.data) {
    return (
      <LoadErrorState
        message="Gagal memuat data menu."
        retryLabel="Kembali ke Daftar Menu"
        onRetry={() => router.push("/manager/menu")}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <BackLink href={`/manager/menu/${menuId}`} label="Batal" />
      </div>
      <MenuForm initialMenu={menuQuery.data} onSubmit={handleSubmit} isSubmitting={updateMenu.isPending} />
    </div>
  )
}
```

Replace `src/app/(private)/manager/menu/create/page.tsx` seluruhnya:
```tsx
"use client"

import { MenuForm } from "@/components/manager/menu/menu-form"
import { useCreateMenu } from "@/hooks/queries/use-menus"
import { toMenuFormData, type MenuFormValues } from "@/lib/menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ManagerMenuCreatePage() {
  const router = useRouter()
  const createMenu = useCreateMenu()

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await createMenu.mutateAsync(toMenuFormData(values, { includeStatus: false }))
      toast.success("Menu berhasil ditambahkan.")
      router.push("/manager/menu")
    } catch {
      toast.error("Gagal menambahkan menu. Silakan coba lagi.")
    }
  }

  return <MenuForm onSubmit={handleSubmit} isSubmitting={createMenu.isPending} />
}
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 15: Staf

**Files:**
- Create: `src/hooks/queries/use-staff.ts`
- Modify: `src/app/(private)/manager/staff/page.tsx`
- Modify: `src/components/manager/staff/staff-table.tsx`
- Modify: `src/components/manager/staff/add-staff-modal.tsx`
- Modify: `src/components/manager/staff/edit-staff-modal.tsx`

**Interfaces:**
- Consumes: `queryKeys`, `StaffListFilters` (Task 4), `DataTable`, `usePaginationState` (Task 12), `getPaginationView`, `paginate` (Task 1).
- Produces: `useStaffList(filters: StaffListFilters)`, `useRegisterStaff()` dengan variabel `RegisterRequest`, `useUpdateStaff()` dengan variabel `{ staffId: number; request: UpdateUserRequest }`, `useDeleteStaff()` dengan variabel `staffId: number`. `StaffTable` dengan props `{ staffMembers: User[]; currentPage: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }`. `AddStaffModal` dengan props `{ onClose: () => void }`. `EditStaffModal` dengan props `{ staff: User; onClose: () => void }`.

- [ ] **Step 1: Hook staf**

Create `src/hooks/queries/use-staff.ts`:
```ts
import { queryKeys, type StaffListFilters } from "@/lib/query-keys"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { RegisterRequest } from "@/types/auth"
import type { UpdateUserRequest } from "@/types/user"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useStaffList(filters: StaffListFilters) {
  return useQuery({
    queryKey: queryKeys.staff.list(filters),
    queryFn: () =>
      userService.getAll({
        q: filters.search || undefined,
        roles: filters.roles.length > 0 ? filters.roles : undefined,
      }),
  })
}

function useInvalidateStaff() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
}

export function useRegisterStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: (request: RegisterRequest) => authService.register(request),
    onSuccess: invalidateStaff,
  })
}

export function useUpdateStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: ({ staffId, request }: { staffId: number; request: UpdateUserRequest }) =>
      userService.update(staffId, request),
    onSuccess: invalidateStaff,
  })
}

export function useDeleteStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: (staffId: number) => userService.remove(staffId),
    onSuccess: invalidateStaff,
  })
}
```

- [ ] **Step 2: Modal tambah dan edit staf memakai mutation**

Di `src/components/manager/staff/add-staff-modal.tsx`:
- Ganti `import { authService } from "@/services/auth.service"` dengan `import { useRegisterStaff } from "@/hooks/queries/use-staff"`.
- Ganti props:
```tsx
type Props = {
  onCreated: () => void
  onClose: () => void
}

export function AddStaffModal({ onCreated, onClose }: Props) {
```
dengan:
```tsx
export function AddStaffModal({ onClose }: { onClose: () => void }) {
```
- Ganti `const [isSubmitting, setIsSubmitting] = useState(false)` dengan `const registerStaff = useRegisterStaff()`.
- Ganti isi `handleSubmit` setelah validasi:
```tsx
    setIsSubmitting(true)
    try {
      const createdStaff = await authService.register({
        username: values.username.trim(),
        email: values.email.trim(),
        role: Number(values.role),
      })
      setDefaultPassword(createdStaff.default_password)
      onCreated()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal menambahkan staf. Silakan coba lagi."))
    } finally {
      setIsSubmitting(false)
    }
```
dengan:
```tsx
    registerStaff.mutate(
      { username: values.username.trim(), email: values.email.trim(), role: Number(values.role) },
      {
        onSuccess: (createdStaff) => setDefaultPassword(createdStaff.default_password),
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal menambahkan staf. Silakan coba lagi.")),
      },
    )
```
- Ubah deklarasi `const handleSubmit = async () => {` menjadi `const handleSubmit = () => {`.
- Di JSX tombol submit, ganti semua `isSubmitting` dengan `registerStaff.isPending`.

Di `src/components/manager/staff/edit-staff-modal.tsx`:
- Ganti `import { userService } from "@/services/user.service"` dengan `import { useUpdateStaff } from "@/hooks/queries/use-staff"`.
- Ganti props:
```tsx
type Props = {
  staff: User
  onSaved: () => void | Promise<void>
  onClose: () => void
}

export function EditStaffModal({ staff, onSaved, onClose }: Props) {
```
dengan:
```tsx
export function EditStaffModal({ staff, onClose }: { staff: User; onClose: () => void }) {
```
- Ganti `const [isSubmitting, setIsSubmitting] = useState(false)` dengan `const updateStaff = useUpdateStaff()`.
- Ganti isi `handleSubmit` setelah validasi:
```tsx
    setIsSubmitting(true)
    try {
      await userService.update(staff.id, {
        username: values.username.trim(),
        email: values.email.trim(),
        role: Number(values.role),
      })
      toast.success("Data staff berhasil diperbarui.")
      await onSaved()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal memperbarui staff. Coba lagi."))
    } finally {
      setIsSubmitting(false)
    }
```
dengan:
```tsx
    updateStaff.mutate(
      {
        staffId: staff.id,
        request: { username: values.username.trim(), email: values.email.trim(), role: Number(values.role) },
      },
      {
        onSuccess: () => {
          toast.success("Data staff berhasil diperbarui.")
          onClose()
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal memperbarui staff. Coba lagi.")),
      },
    )
```
- Ubah `const handleSubmit = async () => {` menjadi `const handleSubmit = () => {`, lalu di JSX ganti semua `isSubmitting` dengan `updateStaff.isPending`.

- [ ] **Step 3: Tabel staf**

Replace `src/components/manager/staff/staff-table.tsx` seluruhnya:
```tsx
"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDeleteStaff } from "@/hooks/queries/use-staff"
import { useAuth } from "@/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api-error"
import { getUserRoleDisplay } from "@/lib/user-role"
import type { User } from "@/types/user"
import { useState } from "react"
import { toast } from "sonner"
import { EditStaffModal } from "./edit-staff-modal"

type Props = {
  staffMembers: User[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function StaffTable({ staffMembers, ...pagination }: Props) {
  const { user: currentUser } = useAuth()
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null)
  const [staffToEdit, setStaffToEdit] = useState<User | null>(null)
  const deleteStaff = useDeleteStaff()

  const handleConfirmDelete = () => {
    if (!staffToDelete) return
    deleteStaff.mutate(staffToDelete.id, {
      onSuccess: () => {
        toast.success("Staf berhasil dihapus.")
        setStaffToDelete(null)
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Gagal menghapus staf. Coba lagi.")),
    })
  }

  const columns: DataTableColumn<User>[] = [
    { header: "Username", cellClassName: "font-medium", render: (staff) => staff.username },
    { header: "Email", cellClassName: "text-muted-foreground", render: (staff) => staff.email },
    {
      header: "Role",
      align: "center",
      render: (staff) => {
        const roleDisplay = getUserRoleDisplay(staff.role, staff.role_name)
        return <StatusBadge label={roleDisplay.label} tone={roleDisplay.tone} />
      },
    },
    {
      header: "Aksi",
      align: "center",
      render: (staff) =>
        staff.id === currentUser?.id ? (
          <span className="text-xs text-muted-foreground italic">Akun Anda</span>
        ) : (
          <RowActionsMenu onEdit={() => setStaffToEdit(staff)} onDelete={() => setStaffToDelete(staff)} />
        ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={staffMembers}
        getRowKey={(staff) => staff.id}
        emptyMessage="Staf tidak ditemukan."
        {...pagination}
      />

      {staffToDelete && (
        <ConfirmDeleteDialog
          title="Hapus staf ini?"
          description={
            <>
              Staff <span className="font-semibold text-foreground">{staffToDelete.username}</span> akan dihapus
              secara permanen. Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={deleteStaff.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setStaffToDelete(null)}
        />
      )}

      {staffToEdit && <EditStaffModal staff={staffToEdit} onClose={() => setStaffToEdit(null)} />}
    </>
  )
}
```

- [ ] **Step 4: Halaman staf**

Replace `src/app/(private)/manager/staff/page.tsx` seluruhnya:
```tsx
"use client"

import { AddStaffModal } from "@/components/manager/staff/add-staff-modal"
import { StaffTable } from "@/components/manager/staff/staff-table"
import { FilterDropdown } from "@/components/shared/filter-dropdown"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useStaffList } from "@/hooks/queries/use-staff"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView, paginate } from "@/lib/pagination"
import { USER_ROLE_OPTIONS } from "@/lib/user-role"
import { UserPlusIcon } from "lucide-react"
import { useState } from "react"

export default function ManagerStaffPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<number[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const staffListQuery = useStaffList({ search: debouncedSearch, roles: roleFilter })
  const staffMembers = staffListQuery.data ?? []
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, staffMembers.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleRoleFilterApply = (roles: number[]) => {
    setRoleFilter(roles)
    pagination.resetToFirstPage()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <UserPlusIcon className="size-4" />
          Tambah Staff
        </button>

        <div className="flex items-center gap-2">
          <FilterDropdown
            title="Role"
            options={USER_ROLE_OPTIONS}
            selectedValues={roleFilter}
            onApply={handleRoleFilterApply}
          />
          <SearchField value={search} onChange={handleSearchChange} placeholder="Cari staff ..." />
        </div>
      </div>

      {staffListQuery.isPending ? (
        <PageLoader />
      ) : staffListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data staf." onRetry={() => staffListQuery.refetch()} />
      ) : (
        <StaffTable
          staffMembers={paginate(staffMembers, currentPage, pagination.pageSize)}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {isAddModalOpen && <AddStaffModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  )
}
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 16: Laporan penjualan

**Files:**
- Create: `src/hooks/queries/use-selling-reports.ts`
- Modify: `src/app/(private)/manager/sales-report/page.tsx`
- Modify: `src/components/manager/sales-report/report-table.tsx`
- Modify: `src/components/manager/sales-report/add-report-modal.tsx`
- Modify: `src/components/manager/sales-report/operational-cost-modal.tsx`

**Interfaces:**
- Consumes: `queryKeys`, `SellingReportListFilters` (Task 4), `DataTable`, `usePaginationState` (Task 12), `getPaginationView`, `paginate` (Task 1).
- Produces: `useSellingReportList(filters: SellingReportListFilters)`, `useCreateSellingReport()` dengan variabel `CreateSellingReportRequest`, `useUpdateOperationalCost()` dengan variabel `{ reportId: number; operationalCost: number }`, `useDeleteSellingReport()` dengan variabel `reportId: number`. Semua mutation menginvalidasi `sellingReports` **dan** `predictions`, karena prediksi AI dihitung dari laporan. `ReportTable` dengan props `{ reports: SellingReport[]; currentPage: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void; onEditOperationalCost: (report: SellingReport) => void }`. `AddReportModal` dengan props `{ onClose: () => void }`. `OperationalCostModal` dengan props `{ report: SellingReport; onClose: () => void }`.

- [ ] **Step 1: Hook laporan**

Create `src/hooks/queries/use-selling-reports.ts`:
```ts
import { queryKeys, type SellingReportListFilters } from "@/lib/query-keys"
import { sellingReportService } from "@/services/selling-report.service"
import type { CreateSellingReportRequest } from "@/types/selling-report"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSellingReportList(filters: SellingReportListFilters) {
  return useQuery({
    queryKey: queryKeys.sellingReports.list(filters),
    queryFn: () =>
      sellingReportService.getAll({
        q: filters.search || undefined,
        month: filters.month || undefined,
        year: filters.year || undefined,
      }),
  })
}

function useInvalidateSellingReports() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sellingReports.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all }),
    ])
}

export function useCreateSellingReport() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: (request: CreateSellingReportRequest) => sellingReportService.create(request),
    onSuccess: invalidateSellingReports,
  })
}

export function useUpdateOperationalCost() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: ({ reportId, operationalCost }: { reportId: number; operationalCost: number }) =>
      sellingReportService.updateOperationalCost(reportId, operationalCost),
    onSuccess: invalidateSellingReports,
  })
}

export function useDeleteSellingReport() {
  const invalidateSellingReports = useInvalidateSellingReports()
  return useMutation({
    mutationFn: (reportId: number) => sellingReportService.remove(reportId),
    onSuccess: invalidateSellingReports,
  })
}
```

- [ ] **Step 2: Modal tambah laporan dan modal operasional**

Di `src/components/manager/sales-report/add-report-modal.tsx`:
- Ganti `import { sellingReportService } from "@/services/selling-report.service"` dengan `import { useCreateSellingReport } from "@/hooks/queries/use-selling-reports"`.
- Ganti props:
```tsx
type Props = {
  onCreated: () => void | Promise<void>
  onClose: () => void
}

export function AddReportModal({ onCreated, onClose }: Props) {
```
dengan:
```tsx
export function AddReportModal({ onClose }: { onClose: () => void }) {
```
- Ganti `const [isSubmitting, setIsSubmitting] = useState(false)` dengan `const createSellingReport = useCreateSellingReport()`.
- Ganti blok setelah validasi di `handleSubmit`:
```tsx
    setIsSubmitting(true)
    try {
      await sellingReportService.create({
```
sampai akhir blok `finally { setIsSubmitting(false) }` dengan:
```tsx
    createSellingReport.mutate(
      {
        title: values.title.trim(),
        date: values.date,
        total_transaction: Number(values.totalTransactions),
        total_items_sold: Number(values.totalItemsSold),
        unit_cost: Number(values.unitCost),
        operational_cost: Number(values.operationalCost),
        gross_revenue: Number(values.grossRevenue),
      },
      {
        onSuccess: () => {
          toast.success("Laporan berhasil dibuat.")
          onClose()
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Gagal membuat laporan. Silakan coba lagi.")),
      },
    )
```
- Ubah `const handleSubmit = async () => {` menjadi `const handleSubmit = () => {`, lalu di JSX ganti `isSubmitting` dengan `createSellingReport.isPending`.

Di `src/components/manager/sales-report/operational-cost-modal.tsx`:
- Ganti `import { sellingReportService } from "@/services/selling-report.service"` dengan `import { useUpdateOperationalCost } from "@/hooks/queries/use-selling-reports"`.
- Ganti props:
```tsx
type Props = {
  report: SellingReport
  onSaved: () => void | Promise<void>
  onClose: () => void
}

export function OperationalCostModal({ report, onSaved, onClose }: Props) {
```
dengan:
```tsx
export function OperationalCostModal({ report, onClose }: { report: SellingReport; onClose: () => void }) {
```
- Ganti `const [isSaving, setIsSaving] = useState(false)` dengan:
```tsx
  const updateOperationalCost = useUpdateOperationalCost()
  const isSaving = updateOperationalCost.isPending
```
- Ganti isi `handleSave` setelah validasi:
```tsx
    setIsSaving(true)
    try {
      await sellingReportService.updateOperationalCost(report.id, Number(operationalCost))
      toast.success("Modal operasional berhasil disimpan.")
      await onSaved()
      onClose()
    } catch {
      toast.error("Gagal menyimpan modal operasional. Coba lagi.")
    } finally {
      setIsSaving(false)
    }
```
dengan:
```tsx
    updateOperationalCost.mutate(
      { reportId: report.id, operationalCost: Number(operationalCost) },
      {
        onSuccess: () => {
          toast.success("Modal operasional berhasil disimpan.")
          onClose()
        },
        onError: () => toast.error("Gagal menyimpan modal operasional. Coba lagi."),
      },
    )
```
- Ubah `const handleSave = async () => {` menjadi `const handleSave = () => {`.

- [ ] **Step 3: Tabel laporan**

Replace `src/components/manager/sales-report/report-table.tsx` seluruhnya:
```tsx
"use client"

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteSellingReport } from "@/hooks/queries/use-selling-reports"
import { formatDate, formatRupiah } from "@/lib/format"
import { downloadReportAsExcel, downloadReportAsPdf } from "@/lib/report-download"
import type { SellingReport } from "@/types/selling-report"
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, Trash2Icon, WalletIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ReportDetailModal } from "./report-detail-modal"

type Props = {
  reports: SellingReport[]
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onEditOperationalCost: (report: SellingReport) => void
}

export function ReportTable({ reports, onEditOperationalCost, ...pagination }: Props) {
  const [reportToView, setReportToView] = useState<SellingReport | null>(null)
  const [reportToDelete, setReportToDelete] = useState<SellingReport | null>(null)
  const deleteSellingReport = useDeleteSellingReport()

  const handleConfirmDelete = () => {
    if (!reportToDelete) return
    deleteSellingReport.mutate(reportToDelete.id, {
      onSuccess: () => {
        toast.success("Laporan berhasil dihapus.")
        setReportToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus laporan. Coba lagi."),
    })
  }

  const columns: DataTableColumn<SellingReport>[] = [
    { header: "Judul", cellClassName: "font-medium", render: (report) => report.title },
    { header: "Tanggal", cellClassName: "text-muted-foreground", render: (report) => formatDate(report.date, "short") },
    { header: "Transaksi", align: "center", cellClassName: "text-muted-foreground", render: (report) => report.total_transaction },
    {
      header: "Modal Operasional",
      align: "right",
      cellClassName: "text-muted-foreground",
      render: (report) => (report.operational_cost != null ? formatRupiah(report.operational_cost) : "—"),
    },
    {
      header: "Pendapatan bersih",
      align: "right",
      cellClassName: "font-medium text-primary",
      render: (report) => formatRupiah(report.net_profit),
    },
    {
      header: "Aksi",
      align: "center",
      render: (report) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEditOperationalCost(report)}
            title="Isi/Edit modal operasional"
            className="p-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
          >
            <WalletIcon className="size-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setReportToView(report)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors"
          >
            Detail
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg border border-foreground/20 hover:border-primary transition-colors" aria-label="Download laporan">
                <DownloadIcon className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => downloadReportAsExcel(report)} className="gap-2 cursor-pointer">
                <FileSpreadsheetIcon className="size-4 text-green-600" />
                Download Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadReportAsPdf(report)} className="gap-2 cursor-pointer">
                <FileTextIcon className="size-4 text-red-500" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setReportToDelete(report)}
            title="Hapus laporan"
            className="p-1.5 rounded-lg border border-foreground/20 hover:border-destructive hover:text-destructive transition-colors"
          >
            <Trash2Icon className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={reports}
        getRowKey={(report) => report.id}
        emptyMessage="Laporan tidak ditemukan."
        {...pagination}
      />

      {reportToView && <ReportDetailModal report={reportToView} onClose={() => setReportToView(null)} />}

      {reportToDelete && (
        <ConfirmDeleteDialog
          title="Hapus laporan ini?"
          description={
            <>
              Laporan <span className="font-semibold text-foreground">{reportToDelete.title}</span> akan dihapus.
              Data yang dihapus tidak dapat dipulihkan.
            </>
          }
          isDeleting={deleteSellingReport.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setReportToDelete(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Halaman laporan**

Di `src/app/(private)/manager/sales-report/page.tsx`:
- Ganti import:
```ts
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLatestRequest } from "@/hooks/use-latest-request"
import { formatDate, formatNumber, formatRupiahInMillions } from "@/lib/format"
import { sellingReportService } from "@/services/selling-report.service"
import type { SellingReport } from "@/types/selling-report"
import { PlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
```
dengan:
```ts
import { useSellingReportList } from "@/hooks/queries/use-selling-reports"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { formatDate, formatNumber, formatRupiahInMillions } from "@/lib/format"
import { getPaginationView, paginate } from "@/lib/pagination"
import type { SellingReport } from "@/types/selling-report"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
```
- Hapus konstanta `const PAGE_SIZE = 20`.
- Ganti blok dari `const [reports, setReports] = useState<SellingReport[]>([])` sampai sebelum `const summary = summarizeReports(reports)` (termasuk `fetchReports`, `useEffect`, `reloadReports`, `handleDelete`, handler filter, `totalPages`, dan `visiblePage`) dengan:
```tsx
  const [search, setSearch] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isMissingCostBannerDismissed, setIsMissingCostBannerDismissed] = useState(false)
  const [reportToEditCost, setReportToEditCost] = useState<SellingReport | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const pagination = usePaginationState()

  const reportListQuery = useSellingReportList({ search: debouncedSearch, month: monthFilter, year: yearFilter })
  const reports = reportListQuery.data ?? []
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, reports.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleMonthChange = (month: string) => {
    setMonthFilter(month === ALL_OPTION ? "" : month)
    pagination.resetToFirstPage()
  }

  const handleYearChange = (year: string) => {
    setYearFilter(year === ALL_OPTION ? "" : year)
    pagination.resetToFirstPage()
  }

```
- Di JSX, ganti blok konten tabel:
```tsx
      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={reloadReports} />
      ) : (
        <ReportTable
          reports={reports}
          currentPage={visiblePage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          onDelete={handleDelete}
          onEditOperationalCost={setReportToEditCost}
        />
      )}

      {isAddModalOpen && (
        <AddReportModal onCreated={reloadReports} onClose={() => setIsAddModalOpen(false)} />
      )}

      {reportToEditCost && (
        <OperationalCostModal
          report={reportToEditCost}
          onSaved={reloadReports}
          onClose={() => setReportToEditCost(null)}
        />
      )}
```
dengan:
```tsx
      {reportListQuery.isPending ? (
        <PageLoader />
      ) : reportListQuery.isError ? (
        <LoadErrorState message="Gagal memuat laporan penjualan." onRetry={() => reportListQuery.refetch()} />
      ) : (
        <ReportTable
          reports={paginate(reports, currentPage, pagination.pageSize)}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
          onEditOperationalCost={setReportToEditCost}
        />
      )}

      {isAddModalOpen && <AddReportModal onClose={() => setIsAddModalOpen(false)} />}

      {reportToEditCost && (
        <OperationalCostModal report={reportToEditCost} onClose={() => setReportToEditCost(null)} />
      )}
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 17: Satuan dan meja

**Files:**
- Create: `src/hooks/queries/use-tables.ts`
- Modify: `src/app/(private)/manager/unit/page.tsx`
- Modify: `src/components/manager/unit/unit-form-dialog.tsx`
- Modify: `src/app/(private)/manager/table-management/page.tsx`

**Interfaces:**
- Consumes: `useUnitList`, `useSaveUnit`, `useDeleteUnit` (Task 13), `DataTable`, `usePaginationState` (Task 12), `getPaginationView`, `paginate` (Task 1).
- Produces: `useTableList()`, `useCreateTable()` dengan variabel `tableNumber: number`, `useDeleteTable()` dengan variabel `tableId: number`. `UnitFormDialog` dengan props `{ unitToEdit: Unit | null; onClose: () => void }`.

- [ ] **Step 1: Hook meja**

Create `src/hooks/queries/use-tables.ts`:
```ts
import { queryKeys } from "@/lib/query-keys"
import { tableService } from "@/services/table.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useTableList() {
  return useQuery({
    queryKey: queryKeys.tables.list(),
    queryFn: () => tableService.getAll({ order_by: "created_at", direction: "DESC" }),
  })
}

function useInvalidateTables() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tables.all })
}

export function useCreateTable() {
  const invalidateTables = useInvalidateTables()
  return useMutation({
    mutationFn: (tableNumber: number) => tableService.create({ number: tableNumber }),
    onSuccess: invalidateTables,
  })
}

export function useDeleteTable() {
  const invalidateTables = useInvalidateTables()
  return useMutation({
    mutationFn: (tableId: number) => tableService.remove(tableId),
    onSuccess: invalidateTables,
  })
}
```

- [ ] **Step 2: Dialog satuan memakai mutation**

Di `src/components/manager/unit/unit-form-dialog.tsx`:
- Ganti `import { unitService } from "@/services/unit.service"` dengan `import { useSaveUnit } from "@/hooks/queries/use-units"`.
- Ganti props:
```tsx
type Props = {
  unitToEdit: Unit | null
  onSaved: () => void
  onClose: () => void
}

export function UnitFormDialog({ unitToEdit, onSaved, onClose }: Props) {
```
dengan:
```tsx
type Props = {
  unitToEdit: Unit | null
  onClose: () => void
}

export function UnitFormDialog({ unitToEdit, onClose }: Props) {
```
- Ganti `const [isSubmitting, setIsSubmitting] = useState(false)` dengan:
```tsx
  const saveUnit = useSaveUnit()
  const isSubmitting = saveUnit.isPending
```
- Ganti `handleSubmit` seluruhnya:
```tsx
  const handleSubmit = () => {
    if (!canSubmit) return
    saveUnit.mutate(
      { unitId: unitToEdit?.id ?? null, request: { name: name.trim(), abbreviation: abbreviation.trim() } },
      {
        onSuccess: () => {
          toast.success("Satuan berhasil disimpan.")
          onClose()
        },
        onError: () => toast.error("Gagal menyimpan satuan. Coba lagi."),
      },
    )
  }
```
- Variabel lain di komponen ini (termasuk yang dipakai untuk judul dialog) tidak diubah.

- [ ] **Step 3: Halaman satuan memakai `DataTable`**

Replace `src/app/(private)/manager/unit/page.tsx` seluruhnya:
```tsx
"use client"

import { UnitFormDialog } from "@/components/manager/unit/unit-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { LoadErrorState, PageLoader } from "@/components/shared/page-state"
import { SearchField } from "@/components/shared/search-field"
import { useDeleteUnit, useUnitList } from "@/hooks/queries/use-units"
import { usePaginationState } from "@/hooks/use-pagination-state"
import { getPaginationView, paginate } from "@/lib/pagination"
import type { Unit } from "@/types/unit"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type UnitDialogState = { isOpen: false } | { isOpen: true; unitToEdit: Unit | null }

export default function ManagerUnitPage() {
  const [search, setSearch] = useState("")
  const [unitDialog, setUnitDialog] = useState<UnitDialogState>({ isOpen: false })
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const pagination = usePaginationState()
  const unitListQuery = useUnitList()
  const deleteUnit = useDeleteUnit()

  const normalizedSearch = search.trim().toLowerCase()
  const visibleUnits = (unitListQuery.data ?? []).filter((unit) =>
    (unit.name ?? "").toLowerCase().includes(normalizedSearch) ||
    (unit.abbreviation ?? "").toLowerCase().includes(normalizedSearch)
  )
  const { currentPage, totalPages } = getPaginationView(pagination.requestedPage, pagination.pageSize, visibleUnits.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.resetToFirstPage()
  }

  const handleConfirmDelete = () => {
    if (!unitToDelete) return
    deleteUnit.mutate(unitToDelete.id, {
      onSuccess: () => {
        toast.success("Satuan berhasil dihapus.")
        setUnitToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus satuan. Pastikan tidak ada stok yang menggunakan satuan ini."),
    })
  }

  const columns: DataTableColumn<Unit>[] = [
    { header: "Nama Satuan", cellClassName: "font-medium", render: (unit) => unit.name },
    { header: "Singkatan", cellClassName: "text-muted-foreground", render: (unit) => unit.abbreviation },
    {
      header: "Aksi",
      align: "center",
      headerClassName: "w-32",
      render: (unit) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setUnitDialog({ isOpen: true, unitToEdit: unit })}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Edit Satuan"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            onClick={() => setUnitToDelete(unit)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Hapus Satuan"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setUnitDialog({ isOpen: true, unitToEdit: null })}
          className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <PlusIcon className="size-4" />
          Tambah Satuan
        </button>
        <SearchField value={search} onChange={handleSearchChange} placeholder="Cari satuan ..." />
      </div>

      {unitListQuery.isPending ? (
        <PageLoader />
      ) : unitListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data satuan." onRetry={() => unitListQuery.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginate(visibleUnits, currentPage, pagination.pageSize)}
          getRowKey={(unit) => unit.id}
          emptyMessage="Belum ada satuan yang ditambahkan atau ditemukan."
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setRequestedPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {unitDialog.isOpen && (
        <UnitFormDialog unitToEdit={unitDialog.unitToEdit} onClose={() => setUnitDialog({ isOpen: false })} />
      )}

      {unitToDelete && (
        <ConfirmDeleteDialog
          title="Hapus satuan ini?"
          description={
            <>
              Satuan <span className="font-semibold text-foreground">{unitToDelete.name}</span> akan dihapus.
              Satuan yang masih dipakai stok tidak dapat dihapus.
            </>
          }
          isDeleting={deleteUnit.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setUnitToDelete(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Halaman meja**

Di `src/app/(private)/manager/table-management/page.tsx`:
- Ganti import:
```ts
import { tableService } from "@/services/table.service"
import type { Table } from "@/types/table"
import { CirclePlusIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
```
dengan:
```ts
import { useCreateTable, useDeleteTable, useTableList } from "@/hooks/queries/use-tables"
import type { Table } from "@/types/table"
import { CirclePlusIcon } from "lucide-react"
import { useState } from "react"
```
- Ganti blok dari `const [tables, setTables] = useState<Table[]>([])` sampai akhir fungsi `handleConfirmDelete` dengan:
```tsx
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const tableListQuery = useTableList()
  const createTable = useCreateTable()
  const deleteTable = useDeleteTable()
  const tables = tableListQuery.data ?? []

  const visibleTables = tables.filter((table) => table.number.toString().includes(search.trim()))

  const handleCreateTable = async (tableNumber: number): Promise<string | null> => {
    if (tables.some((table) => table.number === tableNumber)) return `Meja nomor ${tableNumber} sudah ada.`
    try {
      await createTable.mutateAsync(tableNumber)
      return null
    } catch {
      return "Gagal menambahkan meja. Silakan coba lagi."
    }
  }

  const handleConfirmDelete = () => {
    if (!tableToDelete) return
    deleteTable.mutate(tableToDelete.id, {
      onSuccess: () => {
        toast.success("Meja berhasil dihapus.")
        setTableToDelete(null)
      },
      onError: () => toast.error("Gagal menghapus meja. Coba lagi."),
    })
  }
```
- Di JSX, ganti:
```tsx
      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <LoadErrorState message={error} onRetry={fetchTables} />
```
dengan:
```tsx
      {tableListQuery.isPending ? (
        <PageLoader />
      ) : tableListQuery.isError ? (
        <LoadErrorState message="Gagal memuat data meja." onRetry={() => tableListQuery.refetch()} />
```
dan ganti `isDeleting={isDeleting}` dengan `isDeleting={deleteTable.isPending}`.

- [ ] **Step 5: Verifikasi**

Run: `npm test && npx tsc --noEmit -p . && npx eslint src && npx next build`
Expected: semua PASS.

### Checkpoint Tahap 3

- [ ] Tes manual di browser:
  1. Tabel menu, staf, laporan, stok, dan satuan: default tampil 10 baris. Ganti ke 25, 50, dan 100: tabel kembali ke halaman 1, header tetap menempel saat di-scroll, dan hanya baris yang terlihat yang dirender (cek di React devtools atau elemen DOM).
  2. Buka dropdown ⋯ pada baris di tengah tabel yang di-scroll: menu tampil di posisi yang benar.
  3. **Review Focus 4:** hapus satu-satunya baris di halaman terakhir menu (client) dan stok (server). Tabel pindah ke halaman sebelumnya.
  4. Tambah, ubah, dan hapus data di setiap tabel: daftar segar tanpa reload.
  5. Isi modal operasional laporan: chart prediksi ikut dimuat ulang.
- [ ] Berhenti. Serahkan pesan commit kepada pengguna:
```
feat(client): paginated DataTable with page size and TableVirtuoso

- Add DataTable with 10/25/50/100 rows per page, virtualized above 10
- Migrate menu, staff, sales report, stock, unit and table pages to
  TanStack Query hooks and mutations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

# Tahap 4 — Sisa halaman

### Task 18: Dashboard manager dan chart laporan

**Files:**
- Create: `src/hooks/queries/use-predictions.ts`
- Modify: `src/app/(private)/manager/dashboard/page.tsx`
- Modify: `src/components/manager/sales-report/prediction-chart.tsx`
- Modify: `src/components/manager/sales-report/prediction-accuracy-chart.tsx`

**Interfaces:**
- Consumes: `useManagerStats`, `useManagerChart` (Task 6).
- Produces: `usePredictionForecast(days: number)`, `usePredictionAccuracy(metric: MetricKey)`.

- [ ] **Step 1: Hook prediksi**

Create `src/hooks/queries/use-predictions.ts`:
```ts
import { queryKeys } from "@/lib/query-keys"
import { aiPredictionService } from "@/services/ai-prediction.service"
import { sellingTrendService } from "@/services/selling-trend.service"
import type { MetricKey } from "@/types/selling-trend"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export function usePredictionForecast(days: number) {
  return useQuery({
    queryKey: queryKeys.predictions.forecast(days),
    queryFn: () => aiPredictionService.predict(days),
    placeholderData: keepPreviousData,
  })
}

export function usePredictionAccuracy(metric: MetricKey) {
  return useQuery({
    queryKey: queryKeys.predictions.accuracy(metric),
    queryFn: () => sellingTrendService.getAccuracy({ metric }),
  })
}
```

- [ ] **Step 2: Chart prediksi**

Di `src/components/manager/sales-report/prediction-chart.tsx`:
- Ganti import:
```ts
import { useLatestRequest } from "@/hooks/use-latest-request"
import { aiPredictionService } from "@/services/ai-prediction.service"
import type { HistoryItem, ModelEvaluation, PredictionItem } from "@/types/ai-prediction"
```
dengan:
```ts
import { usePredictionForecast } from "@/hooks/queries/use-predictions"
import type { HistoryItem, ModelEvaluation, PredictionItem } from "@/types/ai-prediction"
```
dan `import { useCallback, useEffect, useState } from "react"` menjadi `import { useState } from "react"`.
- Ganti blok dari `const [data, setData] = useState<{` sampai `useEffect(() => { fetchPrediction(range) }, [fetchPrediction, range])` dengan:
```tsx
  const [range, setRange] = useState<PredictionRangeDays>(30)
  const forecastQuery = usePredictionForecast(range)
  const data = forecastQuery.data ?? null
  const isLoading = forecastQuery.isFetching
  const error = forecastQuery.isError
    ? forecastQuery.error instanceof Error ? forecastQuery.error.message : "Gagal memuat prediksi"
    : null
  const fetchPrediction = () => forecastQuery.refetch()
```
- Ganti semua `onClick={() => fetchPrediction(range)}` menjadi `onClick={fetchPrediction}`.

- [ ] **Step 3: Chart akurasi**

Di `src/components/manager/sales-report/prediction-accuracy-chart.tsx`:
- Ganti import:
```ts
import { useLatestRequest } from "@/hooks/use-latest-request"
import { sellingTrendService } from "@/services/selling-trend.service"
import type { AccuracyResponse, MetricKey } from "@/types/selling-trend"
```
dengan:
```ts
import { usePredictionAccuracy } from "@/hooks/queries/use-predictions"
import type { MetricKey } from "@/types/selling-trend"
```
dan `import { useCallback, useEffect, useState } from "react"` menjadi `import { useState } from "react"`.
- Ganti blok dari `const [data, setData] = useState<AccuracyResponse | null>(null)` sampai `useEffect(() => { fetchAccuracy(metric) }, [fetchAccuracy, metric])` dengan:
```tsx
  const accuracyQuery = usePredictionAccuracy(metric)
  const data = accuracyQuery.data ?? null
  const isLoading = accuracyQuery.isPending
  const error = accuracyQuery.isError ? "Gagal memuat data akurasi." : null
```
- Ganti `onClick={() => fetchAccuracy(metric)}` menjadi `onClick={() => accuracyQuery.refetch()}`.

- [ ] **Step 4: Dashboard manager**

Di `src/app/(private)/manager/dashboard/page.tsx`:
- Ganti import:
```ts
import { useLatestRequest } from "@/hooks/use-latest-request"
import { dashboardService } from "@/services/dashboard.service"
import type { ChartPeriod, ManagerChartData, ManagerDashboardStats } from "@/types/dashboard"
```
dengan:
```ts
import { useManagerChart, useManagerStats } from "@/hooks/queries/use-dashboard"
import type { ChartPeriod, ManagerChartData } from "@/types/dashboard"
```
dan `import { useCallback, useEffect, useState } from "react"` menjadi `import { useEffect, useState } from "react"`.
- Ganti blok dari `const [stats, setStats] = useState<ManagerDashboardStats | null>(null)` sampai `if (isLoadingStats) return <PageLoader />` dengan:
```tsx
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("7d")
  const statsQuery = useManagerStats()
  const chartQuery = useManagerChart(chartPeriod)
  const stats = statsQuery.data ?? null
  const chartData = chartQuery.data ?? EMPTY_CHART_DATA
  const isLoadingChart = chartQuery.isPending

  useEffect(() => {
    if (statsQuery.isError) toast.error("Gagal memuat statistik dashboard.")
  }, [statsQuery.isError])

  const periodDescription = CHART_PERIOD_OPTIONS.find((option) => option.value === chartPeriod)?.description ?? ""

  if (statsQuery.isPending) return <PageLoader />
```

- [ ] **Step 5: Verifikasi**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 19: Buat pesanan kasir, katalog pelanggan, dan invoice

**Files:**
- Modify: `src/app/(private)/cashier/create-order/page.tsx`
- Modify: `src/app/(public)/components/menu-catalog.tsx`
- Modify: `src/app/(public)/payment/invoice/page.tsx`

**Interfaces:**
- Consumes: `useTableList` (Task 17), `useMenuList` (Task 14), `useOrderDetail`, `useRefreshOrderData` (Task 6).

- [ ] **Step 1: Buat pesanan kasir**

Di `src/app/(private)/cashier/create-order/page.tsx`:
- Ganti import:
```ts
import { menuService } from "@/services/menu.service"
import { orderService } from "@/services/order.service"
import { tableService } from "@/services/table.service"
import type { Menu } from "@/types/menu"
import { MenuStatus, MenuType } from "@/types/menu"
import { OrderType } from "@/types/order"
import type { Table } from "@/types/table"
```
dengan:
```ts
import { useMenuList } from "@/hooks/queries/use-menus"
import { useRefreshOrderData } from "@/hooks/queries/use-orders"
import { useTableList } from "@/hooks/queries/use-tables"
import { orderService } from "@/services/order.service"
import type { Menu } from "@/types/menu"
import { MenuStatus, MenuType } from "@/types/menu"
import { OrderType } from "@/types/order"
```
- Ganti:
```tsx
  const [tables, setTables] = useState<Table[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
```
dengan:
```tsx
  const tableListQuery = useTableList()
  const menuListQuery = useMenuList({ search: "", statuses: [] })
  const refreshOrderData = useRefreshOrderData()
  const tables = tableListQuery.data ?? []
  const menus = menuListQuery.data ?? []
  const isPageLoading = tableListQuery.isPending || menuListQuery.isPending
```
- Hapus `const [isPageLoading, setIsPageLoading] = useState(true)`.
- Ganti blok `useEffect` pengambilan meja dan menu:
```tsx
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
```
dengan:
```tsx
  useEffect(() => {
    if (tableListQuery.isError || menuListQuery.isError) {
      toast.error("Gagal memuat data meja dan menu. Muat ulang halaman.")
    }
  }, [tableListQuery.isError, menuListQuery.isError])
```
- Di `handleSubmit`, ganti `router.push("/cashier/order")` dengan:
```tsx
      refreshOrderData()
      router.push("/cashier/order")
```

- [ ] **Step 2: Katalog menu pelanggan**

Di `src/app/(public)/components/menu-catalog.tsx`:
- Ganti import:
```ts
import { useLatestRequest } from "@/hooks/use-latest-request"
import { menuService } from "@/services/menu.service"
```
dengan:
```ts
import { useMenuList } from "@/hooks/queries/use-menus"
```
dan `import { useCallback, useEffect, useState } from "react"` menjadi `import { useState } from "react"`.
- Ganti blok:
```tsx
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search, 400)
  const startRequest = useLatestRequest()

  const fetchMenus = useCallback(async (searchTerm: string) => {
    const isLatest = startRequest()
    setIsLoading(true)
    try {
      const data = await menuService.getAll({ q: searchTerm.trim() || undefined })
      if (isLatest()) setMenus(Array.isArray(data) ? data : [])
    } catch {
      if (isLatest()) setMenus([])
    } finally {
      if (isLatest()) setIsLoading(false)
    }
  }, [startRequest])

  useEffect(() => {
    fetchMenus(debouncedSearch)
  }, [fetchMenus, debouncedSearch])

  if (isLoading) return <PageLoader />
```
dengan:
```tsx
  const debouncedSearch = useDebouncedValue(search.trim(), 400)
  const menuListQuery = useMenuList({ search: debouncedSearch, statuses: [] })
  const menus: Menu[] = menuListQuery.data ?? []

  if (menuListQuery.isPending) return <PageLoader />
```

- [ ] **Step 3: Invoice pelanggan**

Di `src/app/(public)/payment/invoice/page.tsx`:
- Ganti import:
```ts
import { orderService } from "@/services/order.service"
import { OrderStatus, type Order } from "@/types/order"
```
dengan:
```ts
import { useOrderDetail } from "@/hooks/queries/use-orders"
import { OrderStatus, type Order } from "@/types/order"
```
dan `import { Suspense, useEffect, useState } from "react"` menjadi `import { Suspense, useState } from "react"`.
- Ganti:
```tsx
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
```
dengan:
```tsx
  const orderQuery = useOrderDetail(Number(orderId))
  const order = orderQuery.data ?? null
  const isLoading = Boolean(orderId) && orderQuery.isPending
  const loadError = !orderId
    ? "Parameter orderId tidak ditemukan di URL"
    : orderQuery.isError
      ? orderQuery.error instanceof Error ? orderQuery.error.message : "Gagal mengambil data dari server"
      : null
```
- Hapus seluruh blok `useEffect` yang memanggil `orderService.getById`:
```tsx
  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      setLoadError("Parameter orderId tidak ditemukan di URL")
      return
    }

    orderService.getById(parseInt(orderId, 10))
      .then(setOrder)
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Gagal mengambil data dari server"))
      .finally(() => setIsLoading(false))
  }, [orderId])
```

- [ ] **Step 4: Verifikasi**

Run: `npx tsc --noEmit -p . && npx eslint src`
Expected: tanpa error.

### Task 20: Bersihkan pola lama

**Files:**
- Delete: `src/hooks/use-latest-request.ts`

- [ ] **Step 1: Pastikan tidak ada pemakai tersisa**

Run: `grep -rn "useLatestRequest\|refreshKey\|reloadOrders\|onPaymentVerified\|visibilitychange" src`
Expected: tidak ada hasil.

Run: `grep -rln "useEffect" src --include=*.tsx | xargs grep -ln "Service\.\(get\|find\)"`
Expected: tidak ada hasil. Artinya tidak ada lagi komponen yang memanggil service baca di dalam `useEffect`.

- [ ] **Step 2: Hapus hook lama**

Run: `rm src/hooks/use-latest-request.ts`

- [ ] **Step 3: Verifikasi akhir**

Run: `npm test && npx tsc --noEmit -p . && npx eslint src && npx next build`
Expected: semua PASS.

### Checkpoint Tahap 4

- [ ] Tes manual di browser:
  1. Dashboard manager: ganti periode 7/30 hari/6 bulan, lalu kembali ke periode sebelumnya. Data periode sebelumnya tampil langsung dari cache.
  2. Laporan penjualan: ganti rentang prediksi 7/14/30 hari dan metrik akurasi.
  3. Buat pesanan kasir: pesanan baru langsung muncul di `/cashier/order` dan dapur.
  4. Katalog pelanggan: pencarian menu tetap berjalan, dan keranjang tidak berubah.
  5. Invoice pelanggan: tampil untuk pesanan yang sudah dibayar atau diproses.
- [ ] Berhenti. Serahkan pesan commit kepada pengguna:
```
refactor(client): move remaining pages to TanStack Query

- Migrate manager dashboard, prediction charts, cashier create order,
  customer menu catalog and invoice to query hooks
- Remove useLatestRequest and manual fetch-in-effect patterns

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
