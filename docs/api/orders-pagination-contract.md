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
