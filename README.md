# RYUU-STORE

Website suntik sosmed (top up followers/likes/views) — Next.js 14 App Router + TailwindCSS + Supabase + QRIS (buatqris.site).

## ⚠️ WAJIB DIBACA SEBELUM DEPLOY — KEAMANAN

Kredensial (Supabase service key, secret QRIS, password admin) sempat diketik dalam
percakapan untuk membuat project ini. Sebelum go-live untuk publik:

1. **Rotate / regenerate** Supabase `service_role` key (Project Settings → API di
   Supabase Dashboard) dan secret key buatqris.site.
2. **Ganti password admin** (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) ke yang baru & kuat.
3. **Ganti `SESSION_SECRET`** ke string acak baru, contoh generate:
   ```bash
   openssl rand -hex 32
   ```
4. Jangan pernah commit file `.env.local` ke Git/GitHub publik (sudah masuk `.gitignore`).

## 🧱 Struktur Fitur

- Toggle Light/Dark (localStorage)
- Tombol logo "R" di navbar → modal Login Admin
- Auth user custom: SignUp / SignIn (username + password, min 8 karakter) + Mode Tamu
- Flow QRIS: pilih produk → input target → generate QR (buatqris.site) → polling status otomatis
- Webhook `/api/webhook/buatqris` untuk update status transaksi real-time
- Admin Panel (`/admin`): dashboard transaksi, CRUD produk, buat kode redeem, broadcast notifikasi, toggle mode maintenance
- Halaman `/redeem` (khusus user login)
- Halaman `/ulasan`: form ulasan + link WhatsApp CS

## 🚀 Cara Install & Jalankan Lokal

```bash
npm i
cp .env.example .env.local   # lalu isi nilainya (lihat catatan keamanan di atas)
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> Project ini juga sudah menyertakan `.env.local` terisi kredensial yang diberikan saat
> pembuatan awal — **wajib** diganti sebagian besar nilainya sebelum dipakai serius (lihat
> bagian Keamanan).

## 🗄️ Setup Database (Supabase)

1. Buka Supabase Dashboard → project kamu → **SQL Editor**.
2. Copy seluruh isi file `sql/SQL_SUPABASE.sql` di project ini.
3. Paste ke SQL Editor → **Run**.
4. Tabel yang terbentuk: `users`, `products`, `orders`, `redeem_codes`, `redeem_history`,
   `announcements`, `reviews`, dan `app_settings` (tambahan untuk menyimpan status mode
   maintenance).

RLS (Row Level Security) diaktifkan tanpa policy untuk role `anon` — artinya akses
langsung dari browser via anon key otomatis ditolak. Semua baca/tulis data dilakukan
lewat Route Handler Next.js di server memakai `service_role` key (bypass RLS by design).

## ☁️ Deploy ke Vercel

1. Push project ini ke sebuah repo GitHub (private direkomendasikan).
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo tersebut.
3. Di step **Environment Variables**, isi semua variabel yang ada di `.env.example`
   dengan nilai asli kamu (gunakan nilai baru hasil rotate, bukan yang lama).
4. Klik **Deploy**.
5. Setelah live, daftarkan URL webhook di dashboard buatqris.site:
   ```
   https://domain-kamu.vercel.app/api/webhook/buatqris
   ```

## 🔌 Integrasi buatqris.site

Implementasi di `lib/buatqris.ts` mengikuti pola umum REST API pembuatan QRIS
dinamis (`POST /v1/qris/create`, `GET /v1/qris/status/:ref`). Karena format response
persis dari buatqris.site bisa punya nama field yang sedikit berbeda, mapping field
dibuat fleksibel dan **seluruh response mentah tetap disimpan** (`raw`) supaya mudah
disesuaikan jika ada field yang meleset — cek log Vercel Function jika status tidak
terupdate seperti yang diharapkan setelah pembayaran, lalu sesuaikan mapping di
`lib/buatqris.ts` dan `app/api/webhook/buatqris/route.ts` sesuai payload asli yang
diterima.

## 🧪 Status Pengujian

Lihat `TESTING_REPORT.md` untuk hasil code review manual, checklist konsistensi
kode, dan langkah yang **perlu kamu jalankan sendiri** (`npm install`, `npm run build`)
untuk verifikasi build final sebelum deploy — lihat penjelasan kenapa di file tersebut.

## 📁 Struktur Folder Singkat

```
app/            → halaman & API routes (App Router)
  admin/        → panel admin (dilindungi cookie sesi admin)
  api/          → seluruh Route Handler (auth, produk, qris, webhook, dll)
components/     → komponen React (client & shared)
lib/            → supabase client, session/cookie auth, helper buatqris, types
sql/            → SQL_SUPABASE.sql (schema database)
```

## 📞 Kontak CS

WhatsApp: 083169147017
