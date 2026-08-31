# Dine In / Take Away Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kasir dapat membuat pesanan Take Away yang tidak terikat meja, dan seluruh aplikasi menampilkannya dengan benar.

**Architecture:** Kolom `order_type` ditambahkan ke tabel `orders` dan `table_id` dilonggarkan menjadi nullable. Aturan penempatan (Dine In wajib meja, Take Away wajib nama pelanggan) hidup di satu helper murni di server yang dipakai skema Joi maupun service. Di client, logika label meja yang selama ini disalin di enam berkas ditarik menjadi satu helper bersama yang mengembalikan label Dine In atau Take Away.

**Tech Stack:** NestJS 11, Sequelize + sequelize-typescript, sequelize-cli, Joi, Jest (server); Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui (client). Runtime `bun`.

**Spec:** `docs/superpowers/specs/2026-09-01-dine-in-take-away-design.md`

## Global Constraints

- Uang dan angka desimal memakai `DECIMAL(16,3)`; jangan mengubah presisi kolom mana pun.
- Semua teks yang dilihat pengguna berbahasa Indonesia. Label resmi: `"Dine In"` dan `"Take Away"` (dengan spasi, huruf kapital seperti tertulis).
- `OrderTypeEnum.DINE_IN = 0`, `OrderTypeEnum.TAKE_AWAY = 1`. Nilai numerik ini tersimpan di database — jangan diubah urutannya.
- Server: `npm run test`, `npx tsc --noEmit`, `npx eslint <path>` dijalankan dari `server/`.
- `npx tsc --noEmit` di server **sudah** memiliki error lama di `src/core/helpers/query-builder.helper.ts`. Itu bukan bawaan pekerjaan ini. Kriteria lulus: jumlah error di luar berkas tersebut tetap nol. Cara cek: `npx tsc --noEmit 2>&1 | grep -v "query-builder.helper.ts"` harus kosong.
- Client **tidak punya test runner sama sekali**. Jangan memasang Jest/Vitest di client — itu di luar lingkup. Verifikasi client sepenuhnya lewat `npx tsc --noEmit` dan `npx eslint <path>` dari `client/`, ditambah uji manual di Task 8.
- Tailwind v4: gunakan bentuk kanonik (`wrap-break-word`, bukan `break-words`). ESLint di repo ini akan memperingatkan bentuk lama.
- Migration **tidak dijalankan oleh agen**. Jalankan hanya bila pemilik repo memintanya secara eksplisit.
- Commit: repo ini punya aturan "commit hanya bila diminta". Langkah commit di bawah tetap ditulis, tetapi eksekusinya menunggu izin pemilik repo. Bila belum diizinkan, lewati langkah commit dan lanjut ke task berikutnya.
- Jangan menyentuh berkas yang sedang termodifikasi di luar lingkup ini: `ai/*`, `server/src/features/selling-report/selling-report.service.ts`, `server/src/databases/seeders/20260523100002-seed-cashier-user.js`.

---

### Task 1: Enum tipe pesanan dan helper penempatan (server)

Helper ini adalah satu-satunya sumber kebenaran aturan Dine In / Take Away. Joi dan service sama-sama memakainya, sehingga permintaan yang dikirim langsung ke API tidak bisa menembus aturan.

**Files:**
- Create: `server/src/features/order/enums/order-type.enum.ts`
- Create: `server/src/features/order/order-placement.util.ts`
- Test: `server/src/features/order/order-placement.util.spec.ts`

**Interfaces:**
- Consumes: tidak ada.
- Produces:
  - `enum OrderTypeEnum { DINE_IN = 0, TAKE_AWAY = 1 }` (default export dan named export)
  - `getOrderTypeEnumLabel(type: OrderTypeEnum): string`
  - `getOrderTypeEnums(): Array<{ id: number; name: string }>`
  - `interface OrderPlacement { order_type: OrderTypeEnum; table_id: number | null; customer_name: string | null }`
  - `type OrderPlacementResult = { valid: true; placement: OrderPlacement } | { valid: false; message: string }`
  - `resolveOrderPlacement(rawType: unknown, rawTableId: unknown, rawCustomerName: unknown): OrderPlacementResult`

- [ ] **Step 1: Buat enum tipe pesanan**

Buat `server/src/features/order/enums/order-type.enum.ts`. Bentuknya sengaja meniru `order-status.enum.ts` yang sudah ada di folder yang sama.

```ts
export enum OrderTypeEnum {
  DINE_IN = 0,
  TAKE_AWAY = 1,
}

export const getOrderTypeEnumLabel = (orderTypeEnum: OrderTypeEnum) => {
  switch (orderTypeEnum) {
    case OrderTypeEnum.DINE_IN:
      return 'Dine In';
    case OrderTypeEnum.TAKE_AWAY:
      return 'Take Away';
    default:
      return 'Unknown';
  }
};

export const getOrderTypeEnums = () => {
  const enums = Object.entries(OrderTypeEnum);
  const result: Array<{ id: number; name: string }> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getOrderTypeEnumLabel(value as OrderTypeEnum),
      });
    }
  }

  return result;
};

export default OrderTypeEnum;
```

- [ ] **Step 2: Tulis test yang gagal untuk helper penempatan**

Buat `server/src/features/order/order-placement.util.spec.ts`.

```ts
import { resolveOrderPlacement } from './order-placement.util';
import OrderTypeEnum from './enums/order-type.enum';

describe('resolveOrderPlacement', () => {
  it('menerima dine in dengan meja dan tanpa nama pelanggan', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, 3, undefined);
    expect(result).toEqual({
      valid: true,
      placement: { order_type: 0, table_id: 3, customer_name: null },
    });
  });

  it('menyimpan nama pelanggan yang sudah di-trim pada dine in', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, 3, '  Budi  ');
    expect(result.valid === true && result.placement.customer_name).toBe('Budi');
  });

  it('menolak dine in tanpa meja', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, null, 'Budi');
    expect(result.valid).toBe(false);
    expect(result.valid === false && result.message).toContain('meja');
  });

  it('menerima take away tanpa meja selama ada nama pelanggan', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, null, 'Budi');
    expect(result).toEqual({
      valid: true,
      placement: { order_type: 1, table_id: null, customer_name: 'Budi' },
    });
  });

  // Meja tidak boleh ikut tersimpan pada take away, bahkan jika pemanggil
  // mengirimkannya. Kalau lolos, laporan per meja jadi salah.
  it('memaksa table_id null pada take away walaupun dikirimi meja', () => {
    const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, 3, 'Budi');
    expect(result.valid === true && result.placement.table_id).toBeNull();
  });

  it('menolak take away tanpa nama pelanggan', () => {
    for (const name of [undefined, null, '', '   ']) {
      const result = resolveOrderPlacement(OrderTypeEnum.TAKE_AWAY, null, name);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.message).toContain('Nama pelanggan');
    }
  });

  it('menganggap tipe yang tidak dikirim sebagai dine in', () => {
    const result = resolveOrderPlacement(undefined, 3, undefined);
    expect(result.valid === true && result.placement.order_type).toBe(0);
  });

  it('menolak tipe pesanan yang tidak dikenal', () => {
    for (const type of [2, -1, 'dine in', {}]) {
      const result = resolveOrderPlacement(type, 3, 'Budi');
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.message).toContain('Tipe pesanan');
    }
  });

  it('menolak table_id yang bukan angka positif pada dine in', () => {
    for (const tableId of ['abc', 0, -3]) {
      const result = resolveOrderPlacement(OrderTypeEnum.DINE_IN, tableId, null);
      expect(result.valid).toBe(false);
    }
  });
});
```

- [ ] **Step 3: Jalankan test dan pastikan GAGAL**

Run: `cd server && npx jest src/features/order/order-placement.util.spec.ts`
Expected: FAIL — `Cannot find module './order-placement.util'`.

- [ ] **Step 4: Tulis implementasi minimal**

Buat `server/src/features/order/order-placement.util.ts`.

```ts
import OrderTypeEnum from './enums/order-type.enum';

export interface OrderPlacement {
  order_type: OrderTypeEnum;
  table_id: number | null;
  customer_name: string | null;
}

export type OrderPlacementResult =
  | { valid: true; placement: OrderPlacement }
  | { valid: false; message: string };

const toTableId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const toName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

/**
 * Aturan penempatan pesanan. Dine In terikat meja; Take Away tidak punya meja
 * sehingga nama pelanggan menjadi identitas penggantinya. Dipakai skema Joi dan
 * OrderService agar permintaan langsung ke API tidak bisa menembus aturan.
 */
export function resolveOrderPlacement(
  rawType: unknown,
  rawTableId: unknown,
  rawCustomerName: unknown,
): OrderPlacementResult {
  const type = rawType === null || rawType === undefined
    ? OrderTypeEnum.DINE_IN
    : Number(rawType);

  if (type !== OrderTypeEnum.DINE_IN && type !== OrderTypeEnum.TAKE_AWAY) {
    return { valid: false, message: 'Tipe pesanan tidak dikenal' };
  }

  const customer_name = toName(rawCustomerName);

  if (type === OrderTypeEnum.TAKE_AWAY) {
    if (!customer_name) {
      return {
        valid: false,
        message: 'Nama pelanggan wajib diisi untuk pesanan Take Away',
      };
    }
    return {
      valid: true,
      placement: { order_type: type, table_id: null, customer_name },
    };
  }

  const table_id = toTableId(rawTableId);
  if (table_id === null) {
    return {
      valid: false,
      message: 'Nomor meja wajib dipilih untuk pesanan Dine In',
    };
  }

  return { valid: true, placement: { order_type: type, table_id, customer_name } };
}
```

- [ ] **Step 5: Jalankan test dan pastikan LULUS**

Run: `cd server && npx jest src/features/order/order-placement.util.spec.ts`
Expected: PASS, 9 test.

- [ ] **Step 6: Lint dan type-check**

Run: `cd server && npx eslint src/features/order && npx tsc --noEmit 2>&1 | grep -v "query-builder.helper.ts"`
Expected: eslint bersih; keluaran tsc setelah filter kosong.

- [ ] **Step 7: Commit** (hanya bila pemilik repo sudah mengizinkan commit)

```bash
git add server/src/features/order/enums/order-type.enum.ts server/src/features/order/order-placement.util.ts server/src/features/order/order-placement.util.spec.ts
git commit -m "feat(order): tambah enum tipe pesanan dan aturan penempatan"
```

---

### Task 2: Migration dan entity

**Files:**
- Create: `server/src/databases/migrations/20260901010000-add-order-type-to-orders.js`
- Modify: `server/src/features/order/entities/order.entity.ts`

**Interfaces:**
- Consumes: `OrderTypeEnum`, `getOrderTypeEnumLabel` dari Task 1.
- Produces: `Order.order_type: number`, `Order.order_type_name: string` (virtual), `Order.table_id: number | null`.

- [ ] **Step 1: Tulis migration**

Buat `server/src/databases/migrations/20260901010000-add-order-type-to-orders.js`. Gaya transaksinya mengikuti `20260713010000-add-operational-cost-to-selling_reports.js`.

```js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'orders',
        'order_type',
        {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0,
          after: 'table_id',
        },
        { transaction },
      );

      // Take Away tidak punya meja. FK ke `tables` tetap dipertahankan —
      // MySQL mengizinkan NULL pada kolom ber-FK.
      await queryInterface.changeColumn(
        'orders',
        'table_id',
        {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Sengaja gagal bila sudah ada pesanan Take Away (table_id NULL).
      // Rollback tidak boleh menghapus pesanan pelanggan diam-diam; baris
      // tersebut harus ditangani manual lebih dulu.
      await queryInterface.changeColumn(
        'orders',
        'table_id',
        {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.removeColumn('orders', 'order_type', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

Catatan risiko yang harus diperiksa saat migration benar-benar dijalankan: bila MySQL menolak `changeColumn` karena foreign key `orders_ibfk_1`, ubah blok `up` menjadi tiga langkah dalam transaksi yang sama — `queryInterface.removeConstraint('orders', '<nama_constraint>')`, lalu `changeColumn`, lalu `queryInterface.addConstraint('orders', { fields: ['table_id'], type: 'foreign key', name: '<nama_constraint>', references: { table: 'tables', field: 'id' } })`. Nama constraint sebenarnya dilihat dengan `SHOW CREATE TABLE orders`.

- [ ] **Step 2: Perbarui entity**

Di `server/src/features/order/entities/order.entity.ts`, tambahkan import dan kolom. `table_id` menjadi nullable, dan `order_type_name` mengikuti pola `status_name` yang sudah ada di berkas yang sama.

Ganti blok import enum:

```ts
import { getOrderStatusEnumLabel } from '../enums/order-status.enum';
import OrderTypeEnum, { getOrderTypeEnumLabel } from '../enums/order-type.enum';
```

Ganti deklarasi `table_id`:

```ts
  @ForeignKey(() => Tables)
  @Column({ type: DataType.BIGINT, allowNull: true })
  table_id: number | null;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: OrderTypeEnum.DINE_IN,
  })
  order_type: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return getOrderTypeEnumLabel(+this.getDataValue('order_type'));
    },
  })
  order_type_name: string;
```

- [ ] **Step 3: Type-check dan lint**

Run: `cd server && npx tsc --noEmit 2>&1 | grep -v "query-builder.helper.ts" && npx eslint src/features/order src/databases/migrations/20260901010000-add-order-type-to-orders.js`
Expected: keluaran tsc setelah filter kosong; eslint bersih.

Bila `tsc` mengeluh di tempat lain karena `table_id` kini `number | null`, catat berkasnya — tempat itu memang perlu diperbaiki, tapi kerjakan di task yang sesuai (Task 3 untuk server, Task 4-6 untuk client), bukan di sini.

- [ ] **Step 4: JANGAN jalankan migration**

Migration dijalankan pemilik repo dengan `bun x sequelize-cli db:migrate` dari `server/`. Laporkan bahwa migration siap tetapi belum dijalankan.

- [ ] **Step 5: Commit** (hanya bila diizinkan)

```bash
git add server/src/databases/migrations/20260901010000-add-order-type-to-orders.js server/src/features/order/entities/order.entity.ts
git commit -m "feat(order): kolom order_type dan table_id nullable"
```

---

### Task 3: Validasi request, DTO, dan service

**Files:**
- Modify: `server/src/features/order/validations/request/create-order.request.ts`
- Modify: `server/src/features/order/dto/create-order.dto.ts`
- Modify: `server/src/features/order/order.service.ts:27-77`
- Test: `server/src/features/order/validations/request/create-order.request.spec.ts` (create)

**Interfaces:**
- Consumes: `resolveOrderPlacement`, `OrderTypeEnum` dari Task 1.
- Produces: `CreateOrderDto` dengan `order_type?: number` dan `table_id?: number`.

- [ ] **Step 1: Tulis test yang gagal untuk skema Joi**

Buat `server/src/features/order/validations/request/create-order.request.spec.ts`. Skema Joi adalah objek murni, jadi bisa diuji langsung tanpa menyalakan Nest.

```ts
import { createOrderSchema } from './create-order.request';

const items = [{ menu_id: 1, quantity: 2 }];

describe('createOrderSchema', () => {
  it('memberi default dine in ketika order_type tidak dikirim', () => {
    const { error, value } = createOrderSchema.validate({ table_id: 3, items });
    expect(error).toBeUndefined();
    expect(value.order_type).toBe(0);
  });

  it('menolak dine in tanpa table_id', () => {
    const { error } = createOrderSchema.validate({ order_type: 0, items });
    expect(error?.details[0].context?.key).toBe('table_id');
  });

  it('menerima take away tanpa table_id', () => {
    const { error, value } = createOrderSchema.validate({
      order_type: 1,
      customer_name: 'Budi',
      items,
    });
    expect(error).toBeUndefined();
    expect(value.customer_name).toBe('Budi');
  });

  it('menolak take away tanpa customer_name', () => {
    const { error } = createOrderSchema.validate({ order_type: 1, items });
    expect(error?.details[0].context?.key).toBe('customer_name');
  });

  it('menolak take away dengan customer_name kosong', () => {
    const { error } = createOrderSchema.validate({
      order_type: 1,
      customer_name: '   ',
      items,
    });
    expect(error?.details[0].context?.key).toBe('customer_name');
  });

  it('menolak order_type di luar 0 dan 1', () => {
    const { error } = createOrderSchema.validate({ order_type: 5, table_id: 3, items });
    expect(error?.details[0].context?.key).toBe('order_type');
  });

  it('tetap mewajibkan minimal satu item', () => {
    const { error } = createOrderSchema.validate({ table_id: 3, items: [] });
    expect(error?.details[0].context?.key).toBe('items');
  });
});
```

- [ ] **Step 2: Jalankan test dan pastikan GAGAL**

Run: `cd server && npx jest src/features/order/validations/request/create-order.request.spec.ts`
Expected: FAIL — skema sekarang belum mengenal `order_type`, jadi `validate` menolaknya sebagai key tak dikenal dan test default gagal.

- [ ] **Step 3: Perbarui skema Joi**

Ganti seluruh isi `server/src/features/order/validations/request/create-order.request.ts`:

```ts
import * as Joi from 'joi';
import OrderTypeEnum from '../../enums/order-type.enum';

export const createOrderSchema = Joi.object({
  order_type: Joi.number()
    .valid(OrderTypeEnum.DINE_IN, OrderTypeEnum.TAKE_AWAY)
    .default(OrderTypeEnum.DINE_IN),
  table_id: Joi.number().when('order_type', {
    is: OrderTypeEnum.TAKE_AWAY,
    then: Joi.optional().allow(null),
    otherwise: Joi.required(),
  }),
  customer_name: Joi.string().trim().max(100).when('order_type', {
    is: OrderTypeEnum.TAKE_AWAY,
    then: Joi.required(),
    otherwise: Joi.allow('', null).optional(),
  }),
  items: Joi.array().items(
    Joi.object({
      menu_id: Joi.number().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});
```

`Joi.string().trim()` menolak `'   '` karena setelah trim menjadi string kosong, sehingga test "customer_name kosong" lulus tanpa aturan tambahan.

- [ ] **Step 4: Jalankan test dan pastikan LULUS**

Run: `cd server && npx jest src/features/order/validations/request/create-order.request.spec.ts`
Expected: PASS, 7 test.

- [ ] **Step 5: Perbarui DTO**

Ganti isi `server/src/features/order/dto/create-order.dto.ts`:

```ts
export class OrderItemDto {
  menu_id: number;
  quantity: number;
}

export class CreateOrderDto {
  order_type?: number;
  table_id?: number;
  customer_name?: string;
  items: OrderItemDto[];
}
```

- [ ] **Step 6: Perbarui OrderService.create**

Di `server/src/features/order/order.service.ts`, tambahkan import:

```ts
import { resolveOrderPlacement } from './order-placement.util';
```

Lalu ganti awal `create` (baris 28-33 saat ini) sehingga pencarian meja hanya dilakukan untuk Dine In:

```ts
  async create(createOrderDto: CreateOrderDto) {
    const placement = resolveOrderPlacement(
      createOrderDto.order_type,
      createOrderDto.table_id,
      createOrderDto.customer_name,
    );
    if (!placement.valid) {
      return this.response.fail(placement.message, 400);
    }
    const { order_type, table_id, customer_name } = placement.placement;

    const transaction = await this.sequelize.transaction();
    try {
      if (table_id !== null) {
        const table = await this.tableModel.findByPk(table_id, { transaction });
        if (!table) {
          throw new Error(`Table with ID ${table_id} not found`);
        }
      }
```

Dan ganti pemanggilan `this.orderModel.create` (baris 54-59 saat ini):

```ts
      const order = await this.orderModel.create({
        table_id,
        order_type,
        customer_name,
        total_price: totalOrderPrice,
        status: OrderStatusEnum.PENDING,
      }, { transaction });
```

Sisa method tidak berubah.

- [ ] **Step 7: Jalankan seluruh test server, lint, type-check**

Run: `cd server && npx jest && npx eslint src/features/order && npx tsc --noEmit 2>&1 | grep -v "query-builder.helper.ts"`
Expected: seluruh test PASS; eslint bersih; keluaran tsc setelah filter kosong.

- [ ] **Step 8: Commit** (hanya bila diizinkan)

```bash
git add server/src/features/order
git commit -m "feat(order): validasi dan penyimpanan tipe pesanan"
```

---

### Task 4: Tipe client dan helper label tempat

**Files:**
- Modify: `client/src/types/order.ts`
- Create: `client/src/lib/order-place.ts`

**Interfaces:**
- Consumes: bentuk data dari Task 2 dan 3 (`order_type`, `order_type_name`, `table_id` nullable).
- Produces:
  - `enum OrderType { DINE_IN = 0, TAKE_AWAY = 1 }` di `types/order.ts`
  - `Order.order_type: number`, `Order.order_type_name: string`, `Order.table_id: number | null`
  - `CreateOrderRequest.order_type?: number`, `CreateOrderRequest.table_id?: number`
  - `getOrderPlace(order: OrderPlaceInput): { code: string; name: string; isTakeAway: boolean }` di `lib/order-place.ts`
  - `type OrderPlaceInput = { table_id: number | null; order_type?: number }`

- [ ] **Step 1: Perbarui tipe Order**

Di `client/src/types/order.ts`, ubah interface `Order` dan `CreateOrderRequest`, lalu tambahkan enum baru di bawah `OrderStatus`.

`Order` menjadi:

```ts
export interface Order {
  id: number;
  table_id: number | null;
  order_type: number;
  order_type_name: string;
  customer_name?: string | null;
  total_price: number;
  status: number;
  status_name: string;
  cancel_reason?: string | null;
  payment?: { payment_status?: string | null } | null;
  items: OrderItem[];
  created_at?: string;
}
```

Tambahkan setelah `OrderStatus`:

```ts
/** Maps to server OrderTypeEnum */
export enum OrderType {
  DINE_IN = 0,
  TAKE_AWAY = 1,
}
```

`CreateOrderRequest` menjadi:

```ts
export interface CreateOrderRequest {
  order_type?: number;
  table_id?: number;
  customer_name?: string;
  items: CreateOrderItemRequest[];
}
```

- [ ] **Step 2: Buat helper label tempat**

Buat `client/src/lib/order-place.ts`.

Catatan penting: kode yang ada saat ini memformat `table_id` (id baris tabel), bukan `table.number`. Helper ini **mempertahankan perilaku itu apa adanya** — mengubahnya akan mengganti angka yang selama ini dilihat staf, dan itu keputusan terpisah di luar lingkup pekerjaan ini.

```ts
import { OrderType } from "@/types/order"

export type OrderPlaceInput = {
  table_id: number | null
  order_type?: number
}

/**
 * Label tempat sebuah pesanan: nomor meja untuk Dine In, atau penanda Take Away.
 * Sebelumnya pola `T-xx` / `Meja xx` disalin di enam berkas; semuanya sekarang
 * memanggil helper ini agar cabang Take Away hanya ada di satu tempat.
 */
export function getOrderPlace(order: OrderPlaceInput) {
  const isTakeAway =
    order.order_type === OrderType.TAKE_AWAY || order.table_id === null

  if (isTakeAway) {
    return { code: "TA", name: "Take Away", isTakeAway: true }
  }

  const padded = String(order.table_id).padStart(2, "0")
  return { code: `T-${padded}`, name: `Meja ${padded}`, isTakeAway: false }
}
```

`order.table_id === null` sengaja ikut dijadikan penanda: bila suatu pemanggil belum meneruskan `order_type`, tampilan tetap benar dan tidak pernah merender "Meja null".

- [ ] **Step 3: Type-check dan lint**

Run: `cd client && npx tsc --noEmit && npx eslint src/types/order.ts src/lib/order-place.ts`
Expected: `tsc` akan MELAPORKAN ERROR di berkas tampilan yang belum diperbarui (karena `table_id` kini bisa `null`). Itu diharapkan dan diperbaiki di Task 5 dan 6. Yang harus bersih di langkah ini hanyalah `eslint` atas dua berkas di atas. Catat daftar berkas yang error sebagai daftar kerja Task 5-6.

- [ ] **Step 4: Commit** (hanya bila diizinkan; boleh ditunda sampai Task 6 agar tidak ada commit yang gagal type-check)

```bash
git add client/src/types/order.ts client/src/lib/order-place.ts
git commit -m "feat(order): tipe pesanan dan helper label tempat di client"
```

---

### Task 5: Terapkan helper pada tampilan kasir dan dapur

Tujuh berkas, satu pola yang sama: hapus dua baris `tableCode`/`tableName` lokal, panggil `getOrderPlace`. Tambahkan badge Take Away pada dua kartu pesanan.

**Berlaku untuk semua langkah di task ini:** beberapa berkas melakukan destructuring `const { id, table_id, ... } = order`. Setelah `tableCode`/`tableName` diganti `getOrderPlace(order)`, variabel `table_id` menjadi tidak terpakai dan ESLint akan menolaknya. Hapus `table_id` dari destructuring di berkas mana pun yang mengalami ini — jangan menambahkan `eslint-disable` untuk menutupinya.

**Files:**
- Modify: `client/src/components/shared/order/order-card.tsx:98-99,109-115,200`
- Modify: `client/src/components/shared/order/order-detail-modal.tsx:69-71,88-93`
- Modify: `client/src/components/shared/order/payment-verification-modal.tsx:15-21,296-305`
- Modify: `client/src/app/(private)/kitchen/order/components/kitchen-order-card.tsx:105-106,142-148,242,250`
- Modify: `client/src/app/(private)/kitchen/order/components/order-detail-modal.tsx:59-60,77-80`
- Modify: `client/src/app/(private)/cashier/dashboard/components/order-list.tsx:54-64`
- Modify: `client/src/app/(private)/cashier/dashboard/components/payment-list.tsx:17-18,40-45`

**Interfaces:**
- Consumes: `getOrderPlace` dari Task 4.
- Produces: `PaymentVerificationModal` menerima `transaction.placeCode` dan `transaction.placeName` menggantikan `tableCode`/`tableName`.

- [ ] **Step 1: order-card.tsx**

Tambahkan import `import { getOrderPlace } from "@/lib/order-place"`. Ganti baris 98-99:

```tsx
  const place = getOrderPlace(order)
```

Ganti blok header (baris 109-115) sehingga menampilkan badge Take Away:

```tsx
            <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
              {place.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{place.name}</p>
                {place.isTakeAway && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/30">
                    Take Away
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{itemCount} items</p>
            </div>
```

Ganti prop modal di baris 200:

```tsx
          transaction={{ id: String(id), placeCode: place.code, placeName: place.name, total: Number(total_price), items }}
```

- [ ] **Step 2: payment-verification-modal.tsx**

Ganti `tableCode`/`tableName` pada `TransactionSummary` (baris 18-19) menjadi:

```tsx
  placeCode: string
  placeName: string
```

Lalu pada blok informasi pemesanan (baris 296-300), ganti `transaction.tableCode` menjadi `transaction.placeCode` dan `transaction.tableName` menjadi `transaction.placeName`.

- [ ] **Step 3: shared/order-detail-modal.tsx**

Tambahkan import `getOrderPlace`. Ganti baris 70-71 dengan `const place = getOrderPlace(order)`, lalu ganti `{tableCode}` menjadi `{place.code}` dan `{tableName}` menjadi `{place.name}` pada baris 89 dan 92.

- [ ] **Step 4: kitchen-order-card.tsx**

Tambahkan import `getOrderPlace`. Ganti baris 105-106 dengan `const place = getOrderPlace(order)`. Ganti header (baris 142-148) mengikuti pola yang sama dengan Step 1, termasuk badge Take Away — dapur adalah tempat badge ini paling penting karena menentukan pesanan dibungkus atau tidak:

```tsx
            <div className="bg-primary text-white text-sm font-bold rounded-lg px-2 py-3 min-w-[52px] text-center">
              {place.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{place.name}</p>
                {place.isTakeAway && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/30">
                    Take Away
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{itemCount} items</p>
            </div>
```

Ganti `tableName={tableName}` pada baris 242 dan 250 menjadi `tableName={place.name}`. Nama prop `tableName` pada `ConfirmCompleteModal` dan `CancelOrderModal` dibiarkan — mengganti nama prop di dua modal itu di luar lingkup dan tidak mengubah apa pun yang terlihat.

- [ ] **Step 5: kitchen/order-detail-modal.tsx**

Tambahkan import `getOrderPlace`. Ganti baris 59-60 dengan `const place = getOrderPlace(order)`, lalu `{tableCode}` → `{place.code}` (baris 77) dan `{tableName}` → `{place.name}` (baris 80).

- [ ] **Step 6: dashboard/order-list.tsx**

Tambahkan import `getOrderPlace`. Ganti baris 54-55 dengan `const place = getOrderPlace(order)`, lalu `{tableCode}` → `{place.code}` (baris 61) dan `{tableName}` → `{place.name}` (baris 64).

- [ ] **Step 7: dashboard/payment-list.tsx**

Tambahkan import `getOrderPlace`. Ganti baris 17-18:

```tsx
  const place = getOrderPlace(order)
```

Ganti blok header (baris 22-29 saat ini):

```tsx
      <div className="flex items-center gap-3">
        <div className="bg-secondary text-white text-sm font-bold rounded-lg px-3 py-4 min-w-14 text-center">
          {place.code}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{place.name}</p>
          <p className="text-xs text-muted-foreground">Order #{order.id}</p>
        </div>
```

Lalu perbarui prop modal:

```tsx
          transaction={{
            id: String(order.id),
            placeCode: place.code,
            placeName: place.name,
            total: Number(order.total_price),
            items: order.items,
          }}
```

- [ ] **Step 8: Type-check dan lint**

Run: `cd client && npx tsc --noEmit && npx eslint src/components/shared/order src/app/\(private\)/kitchen src/app/\(private\)/cashier`
Expected: `tsc` hanya menyisakan error di berkas invoice dan halaman publik (Task 6). ESLint bersih untuk path di atas.

- [ ] **Step 9: Commit** (hanya bila diizinkan; boleh digabung dengan Task 6)

---

### Task 6: Terapkan pada invoice dan halaman publik

**Files:**
- Modify: `client/src/lib/invoice-download.ts:67-69,155,162`
- Modify: `client/src/lib/invoice-email-html.ts:74-75`
- Modify: `client/src/app/(public)/payment/invoice/page.tsx:136`
- Modify: `client/src/app/(public)/payment/status/[transactionId]/page.tsx:136`

**Interfaces:**
- Consumes: `getOrderPlace` dari Task 4.
- Produces: tidak ada yang dipakai task lain.

- [ ] **Step 1: invoice-download.ts**

Tambahkan import `import { getOrderPlace } from "./order-place";`. Ganti baris 67-69:

```ts
  const { id, table_id, total_price, items, status, created_at } = order;
  const place = getOrderPlace(order);
```

Ganti label kolom di baris 155 dari `"MEJA"` menjadi `"TEMPAT"` — pada struk Take Away, label "MEJA" jelas salah. Ganti baris 162:

```ts
  doc.text(`${place.code}  —  ${place.name}`, iX, y);
```

Bila `table_id` menjadi variabel tak terpakai setelah perubahan ini, hapus dari destructuring agar ESLint tidak mengeluh.

- [ ] **Step 2: invoice-email-html.ts**

Tambahkan import `import { getOrderPlace } from "./order-place";`, hitung `const place = getOrderPlace(order);` di dekat awal fungsi yang merender baris tersebut, lalu ganti baris 74-75:

```ts
            <td style="padding:2px 0;color:#6b7280;font-size:13px;">Tempat</td>
            <td style="padding:2px 0;text-align:right;color:#0f172a;font-size:13px;font-weight:500;">${place.name}</td>
```

- [ ] **Step 3: Halaman invoice publik**

Di `client/src/app/(public)/payment/invoice/page.tsx`, tambahkan import `getOrderPlace` dan ganti baris 136:

```tsx
              <span className="text-2xl text-foreground font-bold">{getOrderPlace(order).name}</span>
```

- [ ] **Step 4: Halaman status pembayaran publik**

Di `client/src/app/(public)/payment/status/[transactionId]/page.tsx`, tambahkan import `getOrderPlace` dan ganti baris 136:

```tsx
          <span className="font-semibold">{getOrderPlace(order).name}</span>
```

- [ ] **Step 5: Type-check dan lint seluruh client**

Run: `cd client && npx tsc --noEmit && npx eslint src`
Expected: keduanya bersih, tanpa error tersisa.

- [ ] **Step 6: Commit** (hanya bila diizinkan)

```bash
git add client/src
git commit -m "feat(order): tampilkan Take Away di seluruh tampilan pesanan"
```

---

### Task 7: Toggle Dine In / Take Away pada form kasir

**Files:**
- Modify: `client/src/app/(private)/cashier/create-order/page.tsx:35-46,96-111,127-154`

**Interfaces:**
- Consumes: `OrderType` dari Task 4, `orderService.create` dengan `CreateOrderRequest` yang sudah diperbarui.
- Produces: tidak ada yang dipakai task lain.

- [ ] **Step 1: Tambah state tipe pesanan dan pesan error**

Tambahkan import `import { OrderType } from "@/types/order"`. Setelah baris 46, tambahkan:

```tsx
  const [orderType, setOrderType] = useState<number>(OrderType.DINE_IN)
  const [formError, setFormError] = useState<string | null>(null)

  const isTakeAway = orderType === OrderType.TAKE_AWAY
```

- [ ] **Step 2: Ganti handleSubmit dengan validasi yang terlihat**

Ganti `handleSubmit` (baris 96-111). Saat ini fungsinya `return` diam-diam sehingga tombol yang ditekan tanpa meja tidak memberi tahu apa pun.

```tsx
  const handleSubmit = async () => {
    if (cart.length === 0) {
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
    setSubmitting(true)
    try {
      await orderService.create({
        order_type: orderType,
        table_id: isTakeAway ? undefined : parseInt(selectedTableId),
        customer_name: customerName.trim() || undefined,
        items: cart.map((i) => ({ menu_id: i.menu.id, quantity: i.quantity })),
      })
      router.push("/cashier/order")
    } catch (error) {
      console.error("Gagal membuat pesanan:", error)
      setFormError("Gagal membuat pesanan. Periksa koneksi lalu coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }
```

- [ ] **Step 3: Ganti panel kiri dengan toggle dan field kondisional**

Ganti blok "Table selector" (baris 127-154) seluruhnya:

```tsx
        <div className="bg-white border border-foreground/10 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Tipe Pesanan</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: OrderType.DINE_IN, label: "Dine In" },
              { value: OrderType.TAKE_AWAY, label: "Take Away" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOrderType(opt.value)
                  setFormError(null)
                }}
                className={`text-sm font-semibold rounded-lg py-2 border transition-colors ${
                  orderType === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/15 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {opt.label}
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
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      Meja {String(t.number).padStart(2, "0")}
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
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama pelanggan"
              maxLength={100}
            />
          </div>

          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}
        </div>
```

- [ ] **Step 4: Perbaiki kondisi `disabled` pada tombol submit**

Tombol submit punya kondisinya sendiri, terpisah dari `handleSubmit`:

```tsx
          disabled={!selectedTableId || cart.length === 0 || submitting}
```

Pada Take Away selector meja disembunyikan sehingga `selectedTableId` selamanya `""`, dan tombol terkunci permanen. Kondisi ini juga membuat pesan error yang ditambahkan di Step 2 tidak pernah muncul, karena tombolnya mati lebih dulu pada syarat yang sama. Ganti menjadi:

```tsx
          disabled={submitting}
```

Syarat lainnya ditolak `handleSubmit` dengan pesan yang terlihat.

- [ ] **Step 5: Type-check dan lint**

Run: `cd client && npx tsc --noEmit && npx eslint "src/app/(private)/cashier/create-order/page.tsx"`
Expected: keduanya bersih.

Catatan: `tsc` dan `eslint` TIDAK bisa menangkap kesalahan kondisi seperti pada Step 4 — keduanya lulus meski tombolnya mati total. Verifikasi sebenarnya hanya lewat uji manual di Task 8.

- [ ] **Step 6: Commit** (hanya bila diizinkan)

```bash
git add "client/src/app/(private)/cashier/create-order/page.tsx"
git commit -m "feat(order): pilihan Dine In / Take Away di form kasir"
```

---

### Task 8: Verifikasi menyeluruh

Task ini tidak mengubah kode. Tujuannya memastikan fitur benar-benar jalan, bukan sekadar lolos compiler.

**Files:** tidak ada.

- [ ] **Step 1: Jalankan seluruh pemeriksaan otomatis**

```bash
cd server && npx jest && npx eslint src && npx tsc --noEmit 2>&1 | grep -v "query-builder.helper.ts"
cd ../client && npx tsc --noEmit && npx eslint src
```
Expected: seluruh test PASS; eslint bersih; keluaran tsc server setelah filter kosong; tsc client bersih.

- [ ] **Step 2: Minta pemilik repo menjalankan migration**

Sampaikan bahwa dua migration menunggu: `add-change-amount-to-payments` dan `add-order-type-to-orders`. Perintahnya, dari `server/`:

```bash
bun x sequelize-cli db:migrate
```

Bila migration gagal karena foreign key pada `table_id`, terapkan varian tiga langkah yang dijelaskan di Task 2 Step 1.

- [ ] **Step 3: Uji manual Dine In**

Buat pesanan Dine In dari halaman kasir. Periksa berturut-turut: kartu di daftar pesanan kasir menampilkan `T-xx` / `Meja xx` tanpa badge; kartu dapur sama; modal verifikasi pembayaran menampilkan meja yang benar; invoice PDF menampilkan `TEMPAT` dengan nomor meja.

- [ ] **Step 4: Uji manual Take Away**

Buat pesanan Take Away. Periksa: tombol submit menolak dengan pesan bila nama pelanggan kosong; setelah tersimpan, kartu kasir dan dapur menampilkan `TA` / `Take Away` beserta badge; modal verifikasi pembayaran menampilkan `Take Away`, bukan `Meja null`; invoice PDF dan halaman status publik menampilkan `Take Away`.

- [ ] **Step 5: Uji penegakan aturan di server**

Kirim permintaan langsung ke API untuk memastikan aturan tidak hanya ada di UI:

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"order_type":1,"items":[{"menu_id":1,"quantity":1}]}'
```
Expected: 422 dengan pesan yang menunjuk `customer_name`.

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"order_type":0,"items":[{"menu_id":1,"quantity":1}]}'
```
Expected: 422 dengan pesan yang menunjuk `table_id`.

Sesuaikan port dan prefix bila konfigurasi lokal berbeda; client memanggil `/api/v1`.

- [ ] **Step 6: Laporkan hasil apa adanya**

Sebutkan langkah mana yang benar-benar dijalankan dan mana yang tidak. Bila migration belum dijalankan pemilik repo, katakan bahwa uji manual belum bisa dilakukan — jangan melaporkan fitur sebagai selesai.