# Vora

Sistem manajemen restoran/kafe dengan pemesanan berbasis QR, pembayaran Midtrans, dan prediksi tren penjualan berbasis machine learning.

Proyek ini terdiri dari tiga layanan yang berjalan berdampingan:

| Folder     | Layanan            | Teknologi                                   | Port default |
| ---------- | ------------------ | ------------------------------------------- | ------------ |
| `server/`  | Backend (BE)       | NestJS 11 · Bun · Sequelize · MySQL         | `8000`       |
| `client/`  | Frontend (FE)      | Next.js 16 · React 19 · Tailwind CSS 4      | `3000`       |
| `ai/`      | AI Prediction      | FastAPI · scikit-learn (Random Forest)      | `8090`       |

### Alur singkat

```
Client (Next.js)  ──▶  Server (NestJS API /api/v1)  ──▶  AI Service (FastAPI /predict)
                                    │
                                    ├─▶ MySQL (data)
                                    ├─▶ Midtrans (pembayaran)
                                    └─▶ AWS S3 (penyimpanan gambar)
```

Frontend hanya berkomunikasi dengan Backend. Backend memanggil AI Service untuk prediksi tren penjualan pada halaman dashboard.

---

## Prasyarat

Pastikan sudah terpasang:

- [Bun](https://bun.sh/) (runtime backend)
- [Node.js](https://nodejs.org/) 20+ (untuk frontend)
- [Python](https://www.python.org/) 3.10+ (untuk AI service)
- [MySQL](https://www.mysql.com/) 8+ yang sudah berjalan

> Urutan menjalankan yang disarankan: **Backend → AI Service → Frontend**.

---

## 1. Backend (BE) — `server/`

NestJS API dengan Sequelize + MySQL.

```bash
cd server

# 1. Install dependency
bun install

# 2. Siapkan environment
cp .env.example .env
# lalu isi kredensial database, Midtrans, AWS, dan SECRET_KEY (lihat di bawah)

# 3. Jalankan migrasi database
bun x sequelize-cli db:migrate

# (opsional) jalankan seeder jika tersedia
bun x sequelize-cli db:seed:all

# 4. Jalankan server (mode development / watch)
bun run start:dev
```

Server berjalan di `http://localhost:8000` dengan prefix API `/api/v1`.

**Isi file `server/.env`:**

```env
# DATABASE
DB_DRIVER=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vora

# KEY (untuk JWT)
SECRET_KEY=isi-dengan-secret-acak

# AWS S3 (penyimpanan gambar menu, dll)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_REGION=
AWS_S3_BUCKET_NAME=

# Midtrans (pembayaran)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# AI Service
AI_SERVICE_URL=http://localhost:8090
```

Script lain yang berguna:

```bash
bun run start          # jalankan biasa (tanpa watch)
bun run start:prod     # mode produksi
bun run test           # unit test
bun run lint           # eslint
```

---

## 2. AI Service (AI) — `ai/`

Layanan prediksi tren penjualan berbasis FastAPI + scikit-learn.

```bash
cd ai

# 1. Buat & aktifkan virtual environment
python -m venv venv
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

# 2. Install dependency
pip install -r requirements.txt

# 3. Siapkan environment
cp .env.example .env      # berisi PORT=8090

# 4. Jalankan service
uvicorn main:app --reload --port 8090
```

Service berjalan di `http://localhost:8090`.

Endpoint utama:

- `GET  /health`  — health check
- `POST /predict` — menerima data historis laporan penjualan dan mengembalikan prediksi (butuh minimal 2 data historis)

> `AI_SERVICE_URL` di `server/.env` harus mengarah ke alamat service ini.

---

## 3. Frontend (FE) — `client/`

Aplikasi web Next.js (App Router).

```bash
cd client

# 1. Install dependency
npm install

# 2. Siapkan environment
# buat file .env.local (lihat contoh di bawah)

# 3. Jalankan development server
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

**Isi file `client/.env.local`:**

```env
# URL backend (sertakan prefix /api/v1)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Midtrans (client key untuk Snap popup di sisi browser)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

Script lain:

```bash
npm run build          # build produksi
npm run start          # jalankan hasil build
npm run lint           # eslint
```

---

## Menjalankan semuanya sekaligus

Buka tiga terminal terpisah:

```bash
# Terminal 1 — Backend
cd server && bun run start:dev

# Terminal 2 — AI Service
cd ai && uvicorn main:app --reload --port 8090

# Terminal 3 — Frontend
cd client && npm run dev
```

Lalu buka `http://localhost:3000` di browser.

---

## Struktur proyek

```
Vora/
├── server/   # Backend NestJS (API, auth, order, payment, dashboard, dll)
├── client/   # Frontend Next.js (halaman manager, kitchen, kasir, customer)
└── ai/       # AI Service FastAPI (prediksi tren penjualan)
```
