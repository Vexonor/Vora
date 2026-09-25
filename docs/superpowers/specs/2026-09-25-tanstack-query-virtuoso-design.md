# TanStack Query dan React Virtuoso di Client

Tanggal: 2026-09-25
Status: menunggu review

## Masalah

Setiap halaman di `client/` mengambil data dengan pola manual yang sama: `useState`
untuk data, `isLoading`, dan `error`, lalu `useEffect` yang memanggil service. Di atas
pola itu ditambal beberapa mekanisme agar hasilnya benar:

- `useLatestRequest` untuk mencegah respons lama menimpa respons baru saat filter atau
  pencarian berganti cepat.
- `refreshKey` dan callback `reloadX` / `onDeleted` / `onUpdated` / `onPaymentVerified`
  yang diteruskan antar komponen agar daftar ikut segar setelah data diubah.
- `setInterval` ditambah listener `visibilitychange` untuk polling pesanan dapur dan
  status pesanan pelanggan.

Mekanisme itu tersebar di sekitar 20 halaman dan harus diingat ulang setiap kali
halaman baru dibuat. Tidak ada cache, sehingga kembali ke halaman yang baru dibuka
selalu menampilkan spinner penuh lagi.

Di sisi tampilan, daftar pesanan merender semua pesanan sekaligus. `GET /orders` tidak
mendukung pagination, sehingga jumlah kartu yang dirender dan data yang diunduh terus
bertambah seiring umur aplikasi. Dapur bahkan mengunduh ulang seluruh riwayat pesanan
setiap 10 detik. Tabel manager dipaginasi tetap 20 baris per halaman tanpa pilihan.

## Ruang lingkup

Termasuk:

- Memasang TanStack Query v5 sebagai lapisan pengelola data di atas axios dan
  `services/*` yang sudah ada.
- Infinite scroll dengan `VirtuosoGrid` di halaman pesanan kasir, manager, dan dapur.
- Polling status pesanan pelanggan melalui TanStack Query.
- Komponen tabel bersama dengan pilihan jumlah baris per halaman, yang memakai
  `TableVirtuoso` saat baris per halaman lebih dari 10.
- Migrasi seluruh halaman yang masih mengambil data secara manual.
- Dokumen kontrak API pagination pesanan sebagai acuan refactor backend.
- Vitest untuk logika murni yang tidak terlihat dari tampilan.

Tidak termasuk:

- Perubahan backend. `GET /orders` belum diberi pagination pada pekerjaan ini. Client
  disiapkan agar perubahan backend nanti cukup mengganti satu fungsi.
- Virtualisasi katalog menu pelanggan dan daftar pendek di dashboard kasir. Daftar itu
  kecil atau sudah dibatasi server.
- Test otomatis untuk komponen UI.

## Keputusan desain

### 1. Satu pintu untuk daftar pesanan: `orderService.getPage`

Semua daftar pesanan mengambil data lewat satu fungsi:

```ts
orderService.getPage({ page, limit, statuses, search })
  -> Promise<{ orders: Order[]; count: number; hasNextPage: boolean }>
```

Bentuk keluaran sengaja disamakan dengan respons yang diharapkan dari backend setelah
pagination ditambahkan (`{ count, orders }`), mengikuti pola respons stok.

Selama backend belum berubah, `getPage` adalah adapter:

1. Memanggil `GET /orders` dengan filter `status`, yang sudah didukung server.
2. Menerapkan pencarian di browser terhadap kode tempat (`T-01`, `TA`), nama tempat
   (`Meja 01`, `Take Away`), nama pelanggan, dan `#id`. Aturan ini sama dengan pencarian
   dapur saat ini, sehingga pencarian nama pelanggan tidak hilang.
3. Memotong hasil sesuai `page` dan `limit`, lalu menghitung `count` dan `hasNextPage`.

Adapter menyimpan hasil `GET /orders` per kombinasi `statuses` selama 5 detik, sehingga
memuat halaman 2, 3, dan seterusnya dalam satu siklus tidak memanggil server berulang
kali. Jeda ini lebih pendek dari interval polling dapur (10 detik), sehingga setiap
siklus polling tetap mengambil data terbaru dari server.

Setelah backend mendukung pagination, isi `getPage` cukup diganti menjadi satu
pemanggilan `GET /orders` dengan `page`, `limit`, `status`, dan `search`. Hook, halaman,
dan komponen tidak berubah.

Konsekuensi yang diterima: selama adapter dipakai, rendering sudah ringan karena
hanya 20 kartu dimuat per scroll, tetapi jaringan masih mengunduh semua pesanan pada
setiap pemuatan ulang. Penghematan data baru terjadi setelah backend diubah.

Alternatif yang ditolak: mengubah backend sekarang. Ditunda atas permintaan tim agar
refactor backend dikerjakan terpisah. Rancangan backend dicatat di dokumen kontrak.

### 2. Fondasi TanStack Query

- Paket: `@tanstack/react-query` v5 dan `@tanstack/react-query-devtools`. Devtools
  hanya dirender saat `NODE_ENV === "development"`.
- Provider: komponen client `components/providers/app-providers.tsx` membungkus
  `QueryClientProvider`, `AuthProvider`, `TooltipProvider`, dan `CartProvider`.
  `app/layout.tsx` tetap server component dan cukup merender `AppProviders`.
  `QueryClient` dibuat di dalam `useState`.
- Default `QueryClient`:
  - `staleTime` 30 detik.
  - Query di-retry satu kali hanya untuk error jaringan atau status 5xx. Status 4xx tidak
    di-retry. Mutation tidak di-retry.
  - `refetchOnWindowFocus` aktif. Polling berhenti otomatis saat tab tidak aktif.
- Redirect 401 ke `/login` tetap ditangani interceptor axios.
- `queryKey` terpusat di `lib/query-keys.ts` dengan pola `domain.all`,
  `domain.list(filters)`, dan `domain.detail(id)`. Contoh: `queryKeys.orders.all`,
  `queryKeys.orders.list({ statuses, search })`, `queryKeys.orders.detail(id)`.
  Domain yang tercakup: orders, payments, stocks, units, menus, users, sellingReports,
  tables, dashboard, predictions.
- Hook per domain di `hooks/queries/`, satu file per domain. Hook query diberi nama
  `useXxxList`, `useXxxDetail`, dan sejenisnya. Hook mutation diberi nama berdasarkan
  aksinya, misalnya `useUpdateOrderStatus`, `useCancelOrder`, `useDeleteStock`. Setiap
  mutation menginvalidasi prefix domainnya di `onSuccess`, sehingga halaman tidak perlu
  mengenal `queryKey`.
- Error query ditampilkan dengan `LoadErrorState`, dan tombolnya memanggil `refetch`.
  Toast sukses/gagal mutation tetap ditentukan pemanggil karena pesannya spesifik per
  aksi. Pesan dari server dibaca dengan `getApiErrorMessage`.
- Nilai pencarian tetap di-debounce dengan `useDebouncedValue` sebelum masuk ke
  `queryKey`.

### 3. Pesanan: infinite scroll dengan `VirtuosoGrid`

- Hook `useOrderList({ statuses, search })` memakai `useInfiniteQuery` di atas
  `orderService.getPage` dengan `limit` 20. `initialPageParam` bernilai 1, dan halaman
  berikutnya diminta selama `hasNextPage` bernilai true. Semua halaman digabung menjadi
  satu daftar, dan ID yang dobel dibuang karena pagination berbasis offset bisa bergeser
  saat pesanan baru masuk.
- Status yang dikirim berasal dari dropdown filter jika ada, dan dari tab jika tidak.
  Aturan ini sama dengan perilaku sekarang.
- Dapur memakai `refetchInterval` 10 detik. Semua halaman yang sudah dimuat disegarkan.
- Status pesanan pelanggan memakai `useOrderDetail(id)` dengan `refetchInterval` 8 detik
  yang mengembalikan `false` saat status Selesai atau Dibatalkan. Data terakhir tetap
  ditampilkan jika satu kali polling gagal.
- `VirtuosoGrid` memakai `useWindowScroll`, sehingga yang di-scroll tetap halaman itu
  sendiri. Kelas grid responsif yang ada dipindah ke `listClassName`. `endReached`
  memanggil `fetchNextPage` jika `hasNextPage` bernilai true dan halaman berikutnya
  sedang tidak dimuat. Footer grid menampilkan "Memuat pesanan lain…", "Semua pesanan
  sudah ditampilkan", atau tombol "Coba muat lagi" jika halaman berikutnya gagal dimuat.
- `VirtuosoGrid` mensyaratkan semua item sama tinggi. Daftar item di `OrderSummary`
  diubah dari `max-h-24` menjadi tinggi tetap `h-24` yang tetap bisa di-scroll, sehingga
  seluruh kartu pesanan sama tinggi.
- Mutation `useUpdateOrderStatus`, `useCancelOrder`, dan `useVerifyCashPayment`
  menginvalidasi `orders` dan `dashboard`. Rantai `onPaymentVerified`, `reloadOrders`,
  dan `refreshKey` dashboard kasir dihapus. `KitchenOrderCard` memanggil mutation sendiri
  dan tidak lagi menerima `onUpdateStatus` atau `onCancel`.

### 4. Tabel: `DataTable` dengan pilihan jumlah baris dan `TableVirtuoso`

- Komponen `components/shared/data-table.tsx` menerima `columns` (header, perataan,
  kelas, dan fungsi `render`), `rows`, `getRowKey`, `emptyMessage`, `pagination`, dan
  `isRefreshing`. Kolom nomor urut dihitung dari `(currentPage - 1) × pageSize`.
- Di bawah tabel tampil `TablePagination` ditambah pilihan 10, 25, 50, atau 100 baris per
  halaman. Default 10. Mengganti jumlah baris mengembalikan tabel ke halaman 1.
- Jika baris per halaman ≤ 10, tabel dirender sebagai `<table>` biasa. Jika lebih dari
  10, tabel dirender dengan `TableVirtuoso` di dalam wadah bertinggi tetap setara
  sekitar 10 baris, dengan header menempel.
- Menu, staf, laporan penjualan, dan satuan mengambil seluruh data dengan `useQuery`
  lalu dipaginasi di browser. Stok memakai pagination server yang sudah ada, dengan
  `placeholderData: keepPreviousData` agar pergantian halaman tidak berkedip.
- Tabel satuan, yang saat ini tanpa pagination, ikut memakai `DataTable`.
- Operasi tambah, ubah, dan hapus di menu, staf, laporan, stok, satuan, dan meja menjadi
  hook mutation. Halaman yang ditampilkan tetap dibatasi ke halaman terakhir yang ada,
  sehingga menghapus item terakhir di sebuah halaman tidak meninggalkan tabel kosong.

### 5. Halaman lain yang dimigrasi

Dashboard kasir dan manager (statistik dan chart per periode), chart prediksi AI dan
chart akurasi, detail dan edit stok serta menu, status pembayaran di modal verifikasi,
halaman buat pesanan kasir (daftar meja dan menu), katalog menu pelanggan, dan invoice
pelanggan. Tampilannya tidak berubah.

Setelah migrasi, `hooks/use-latest-request.ts` dihapus, dan tidak ada lagi halaman yang
mengambil data dengan `useEffect` dan `useState` manual.

## Struktur file baru

```
client/src/
  components/providers/app-providers.tsx
  components/shared/data-table.tsx
  hooks/queries/use-orders.ts
  hooks/queries/use-stocks.ts
  hooks/queries/use-menus.ts
  hooks/queries/use-users.ts
  hooks/queries/use-selling-reports.ts
  hooks/queries/use-units.ts
  hooks/queries/use-tables.ts
  hooks/queries/use-dashboard.ts
  hooks/queries/use-predictions.ts
  lib/query-client.ts
  lib/query-keys.ts
docs/api/orders-pagination-contract.md
```

## Tahapan

Setiap tahap menjadi satu commit, dan aplikasi tetap berjalan normal di akhir tiap tahap.

1. **Fondasi.** Pemasangan paket, `AppProviders`, `query-client.ts`, `query-keys.ts`,
   adapter `orderService.getPage` beserta test-nya, pemasangan Vitest, dan dokumen
   kontrak API pesanan. Belum ada halaman yang berubah perilakunya.
2. **Pesanan.** Hook pesanan, infinite scroll dan `VirtuosoGrid` di halaman pesanan
   kasir, manager, dan dapur, polling status pesanan pelanggan, serta mutation di modal
   verifikasi pembayaran dan dashboard kasir.
3. **Tabel.** `DataTable`, pilihan jumlah baris, dan migrasi tabel menu, staf, laporan,
   stok, dan satuan beserta mutation CRUD-nya, termasuk meja.
4. **Sisa halaman.** Dashboard, chart, halaman detail dan edit, buat pesanan kasir,
   katalog, dan invoice. Penghapusan `useLatestRequest` dan pola lama.

## Verifikasi

- Vitest untuk logika murni:
  - adapter `getPage`: potongan halaman, `count`, `hasNextPage`, dan pencarian kode,
    nama tempat, nama pelanggan, serta `#id`,
  - penggabungan halaman infinite query beserta penghapusan ID dobel,
  - pembatasan halaman saat jumlah data berkurang.
- Setiap tahap: `tsc --noEmit`, `eslint`, dan `next build` bersih.
- Checklist tes manual di browser per tahap. Untuk tahap 2 misalnya: scroll pesanan
  sampai habis, ganti tab di tengah scroll, ubah status pesanan di dapur lalu pastikan
  daftar kasir ikut segar, dan pastikan polling berhenti saat tab disembunyikan.

## Risiko

- **Tinggi kartu pesanan.** Jika isi kartu suatu saat membuat tinggi kartu berbeda,
  `VirtuosoGrid` akan salah menghitung posisi. Tinggi area daftar item harus tetap
  dijaga saat kartu diubah.
- **Adapter mengunduh semua pesanan.** Sampai backend diubah, beban jaringan pesanan
  tetap sama seperti sekarang.
- **Pergeseran offset.** Pesanan baru yang masuk saat pengguna sedang scroll dapat
  menggeser halaman berikutnya. Penghapusan ID dobel mencegah kartu ganda, tetapi satu
  pesanan bisa terlewat sampai daftar disegarkan. Polling dan invalidasi setelah
  mutation menutup celah ini dalam hitungan detik.
