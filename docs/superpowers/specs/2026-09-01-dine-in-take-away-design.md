# Dine In / Take Away pada Pemesanan

Tanggal: 2026-09-01
Status: disetujui untuk implementasi

## Masalah

Setiap pesanan di Vora selalu terikat pada satu meja. `orders.table_id` berstatus
`NOT NULL` dengan foreign key ke `tables`, dan seluruh tampilan merender nomor meja
tanpa alternatif. Akibatnya restoran tidak bisa mencatat pesanan bawa pulang: kasir
terpaksa memilih meja yang sebenarnya tidak dipakai, sehingga data meja menjadi
menyesatkan dan dapur tidak tahu pesanan mana yang harus dibungkus.

## Ruang lingkup

Termasuk:

- Pilihan Dine In / Take Away pada halaman kasir membuat pesanan.
- Penyimpanan tipe pesanan di database dan penegakan aturannya di server.
- Penyesuaian seluruh tampilan yang selama ini selalu menampilkan meja.

Tidak termasuk:

- Alur pemesanan pelanggan lewat scan QR. Pelanggan yang memindai QR meja memang
  sedang duduk di meja itu, jadi alur tersebut tetap Dine In tanpa pilihan.
- Laporan penjualan yang dipecah per tipe pesanan. Kolom `order_type` sudah cukup
  untuk menambahkannya kapan saja, tetapi tidak dikerjakan sekarang.
- Nomor antrian otomatis. Nama pelanggan dipakai sebagai identitas pengganti meja.

## Keputusan desain

### Tipe pesanan disimpan sebagai kolom, meja menjadi opsional

`orders` mendapat kolom `order_type`, dan `table_id` dilonggarkan menjadi nullable.
Pesanan Take Away menyimpan `table_id = NULL`.

Alternatif yang ditolak: menyeed satu baris meja khusus bernama "Take Away" agar
`table_id` tetap `NOT NULL`. Cara itu memang tidak merusak satu pun tampilan, tetapi
menaruh data palsu di tabel master yang punya UI sendiri — meja itu akan muncul di
Manajemen Meja lengkap dengan QR yang tidak berarti, dan ikut terhitung dalam
statistik meja. Ia juga tetap memerlukan `order_type` agar bisa dibedakan dengan
andal, jadi tidak ada pekerjaan yang benar-benar dihemat.

### Nama pelanggan menjadi identitas pengganti meja

Take Away mewajibkan `customer_name`, yang selama ini opsional. Kolomnya sudah ada,
tidak ada logika baru, dan staf punya pegangan untuk memanggil pesanan. Nomor antrian
otomatis lebih rapi untuk restoran ramai, tetapi menuntut kolom baru, reset harian,
dan penanganan bentrok antar kasir — tidak sepadan untuk kebutuhan sekarang.

### Aturan ditegakkan di server

Validasi tidak boleh hanya hidup di UI. Sebuah helper murni menjadi satu-satunya
sumber kebenaran, dipakai baik oleh skema Joi maupun service, sehingga permintaan
yang dikirim langsung ke API tidak bisa menembusnya.

## Rancangan

### Enum

`server/src/features/order/enums/order-type.enum.ts`, meniru bentuk
`order-status.enum.ts` yang sudah ada:

- `OrderTypeEnum` — `DINE_IN = 0`, `TAKE_AWAY = 1`
- `getOrderTypeEnumLabel(type)` — "Dine In" / "Take Away" / "Unknown"
- `getOrderTypeEnums()` — daftar `{ id, name }`

### Skema database

Satu migration, `add-order-type-to-orders`:

- `addColumn('orders', 'order_type')` — `TINYINT`, `NOT NULL`, `defaultValue: 0`,
  ditempatkan setelah `table_id`. Default `0` membuat seluruh pesanan lama otomatis
  tercatat sebagai Dine In, yang memang benar secara historis.
- `changeColumn('orders', 'table_id')` — `BIGINT`, `allowNull: true`.

`down` melakukan kebalikannya. Mengembalikan `table_id` menjadi `NOT NULL` akan
gagal bila sudah ada pesanan Take Away di database. Kegagalan itu disengaja:
rollback tidak boleh menghapus pesanan pelanggan secara diam-diam. Bila rollback
benar-benar dibutuhkan, baris Take Away harus ditangani manual lebih dulu.

Risiko yang harus diverifikasi saat implementasi: `orders.table_id` memiliki foreign
key ke `tables`. Pada MySQL, `MODIFY COLUMN` umumnya tidak membatalkan foreign key,
sehingga `changeColumn` diperkirakan aman. Bila ternyata ditolak, migration diubah
menjadi tiga langkah dalam satu transaksi: drop constraint, modify column, lalu
pasang kembali constraint dengan nama yang sama.

### Entity

`Order` mendapat:

- `order_type: number` — `TINYINT`, `NOT NULL`, default `OrderTypeEnum.DINE_IN`
- `order_type_name: string` — kolom `VIRTUAL` yang memanggil `getOrderTypeEnumLabel`,
  sejajar dengan `status_name`, agar client tidak memetakan angka sendiri
- `table_id` berubah menjadi `number | null`

### Aturan penempatan pesanan

`server/src/features/order/order-placement.util.ts` mengekspor satu fungsi murni
yang menerima `order_type`, `table_id`, dan `customer_name` mentah, lalu
mengembalikan hasil terdiskriminasi: valid dengan nilai yang sudah dinormalkan, atau
tidak valid dengan pesan berbahasa Indonesia.

Aturannya:

- Tipe di luar `0` dan `1` ditolak.
- Dine In wajib `table_id`; `customer_name` tetap opsional.
- Take Away wajib `customer_name` yang tidak kosong setelah di-trim, dan selalu
  menghasilkan `table_id = null` walaupun pemanggil mengirimkan nilai.

Fungsi ini punya unit test tersendiri, mengikuti pola `cash-payment.util.spec.ts`.
Repositori ini belum punya test untuk service, jadi cakupan test berhenti di helper.

### Validasi request

`create-order.request.ts` menambahkan `order_type` sebagai angka opsional bernilai
`0` atau `1` dengan default `0`, lalu memakai `Joi.when` sehingga `table_id` wajib
saat Dine In dan `customer_name` wajib saat Take Away. `CreateOrderDto` menyesuaikan:
`order_type?: number` dan `table_id?: number`.

### Service

`OrderService.create` memanggil helper penempatan lebih dulu dan menolak permintaan
yang tidak valid. Pencarian meja hanya dijalankan untuk Dine In — saat ini
`tableModel.findByPk` selalu dipanggil dan melempar error bila meja tidak ditemukan.
Nilai `order_type` dan `table_id` hasil normalisasi helper yang disimpan.

### Tampilan

Pola `T-${...}` dan `Meja ${...}` saat ini disalin di enam file. Menambahkan cabang
Take Away di setiap tempat berarti menyalin cabang itu enam kali pula, jadi logikanya
ditarik menjadi satu helper client `src/lib/order-place.ts`:

```
getOrderPlace(order) -> { code, name, isTakeAway }
```

Dine In menghasilkan `{ "T-03", "Meja 03" }`, Take Away menghasilkan
`{ "TA", "Take Away" }`. Pemanggil menampilkan `customer_name` sebagai baris
pendamping seperti sebelumnya.

Berkas yang menyesuaikan:

- `components/shared/order/order-card.tsx`
- `components/shared/order/order-detail-modal.tsx`
- `components/shared/order/payment-verification-modal.tsx`
- `app/(private)/kitchen/order/components/kitchen-order-card.tsx`
- `app/(private)/kitchen/order/components/order-detail-modal.tsx`
- `app/(private)/cashier/dashboard/components/order-list.tsx`
- `app/(private)/cashier/dashboard/components/payment-list.tsx`
- `app/(public)/payment/invoice/page.tsx`
- `app/(public)/payment/status/[transactionId]/page.tsx`
- `lib/invoice-download.ts`
- `lib/invoice-email-html.ts`

Kartu pesanan di kasir dan dapur menampilkan badge "Take Away" agar staf langsung
tahu pesanan itu harus dibungkus, bukan disajikan ke meja.

Tipe `Order` di client menyesuaikan: `table_id: number | null`, ditambah `order_type`
dan `order_type_name`. `CreateOrderRequest` mendapat `order_type` dan `table_id`
opsional.

### Form kasir

Panel kiri `app/(private)/cashier/create-order/page.tsx` mendapat toggle Dine In /
Take Away dengan Dine In sebagai default.

- Dine In: selector meja tampil dan wajib, nama pelanggan opsional.
- Take Away: selector meja disembunyikan, nama pelanggan wajib dan labelnya tidak
  lagi bertanda opsional.

Saat ini `handleSubmit` diawali `if (!selectedTableId || cart.length === 0) return`,
sehingga tombol yang ditekan tanpa meja tidak melakukan apa pun tanpa penjelasan.
Validasi diganti menjadi pesan yang terlihat oleh kasir, menyebutkan syarat mana
yang belum terpenuhi.

## Verifikasi

- Unit test helper penempatan pesanan pada server.
- `type-check` dan `eslint` pada server dan client. Catatan: `tsc` server sudah
  memiliki error lama di `core/helpers/query-builder.helper.ts` yang tidak
  berhubungan dengan pekerjaan ini; jumlah error di luar berkas itu harus tetap nol.
- Uji manual satu pesanan per tipe, menembus dapur, kasir, verifikasi pembayaran,
  hingga invoice.

## Catatan implementasi

Migration dijalankan manual oleh pemilik repositori dengan
`bun x sequelize-cli db:migrate` dari direktori `server/`. Ada satu migration lain
yang juga masih menunggu dijalankan, `add-change-amount-to-payments`.