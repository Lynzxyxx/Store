# TESTING_REPORT.md — RYUU-STORE

## ⚠️ Catatan jujur tentang laporan ini

Saya (Claude) membangun project ini di sandbox **tanpa akses internet**, sehingga
saya **tidak bisa** benar-benar menjalankan `npm install`, `npm run dev`, atau
`npm run build` terhadap npm registry / Supabase / buatqris.site yang sesungguhnya.

Laporan ini adalah hasil **code review manual** (pengecekan struktur, import,
konsistensi tipe, dan konsistensi skema database secara statis) — bukan hasil
eksekusi build sungguhan. Saya sengaja tidak menulis klaim seperti "0 error, build
100% sukses" karena itu tidak bisa saya buktikan dan berpotensi menyesatkan.

**Langkah yang WAJIB kamu jalankan sendiri sebelum deploy:**
```bash
npm install
npm run build
```
Jika muncul error, kirim pesan error lengkapnya — saya perbaiki cepat berdasarkan
pesan error asli (jauh lebih akurat daripada saya menebak hasil build).

---

## ✅ Hal yang sudah diverifikasi secara statis

| # | Pengecekan | Hasil |
|---|---|---|
| 1 | Semua import `@/lib/...` dan `@/components/...` menunjuk ke file yang benar-benar ada | OK — 19/19 path cocok |
| 2 | Semua import relatif (`./Icons`, dll) menunjuk ke file yang ada | OK |
| 3 | Kurung `()`, `{}`, `[]` seimbang di setiap file `.ts`/`.tsx` | OK — tidak ada yang tidak seimbang |
| 4 | Tidak ada folder kosong sisa scaffolding yang tidak terpakai | OK |
| 5 | Semua nama tabel yang dipanggil via `.from("...")` di kode ada di `SQL_SUPABASE.sql` | OK — 8/8 tabel (`users`, `products`, `orders`, `redeem_codes`, `redeem_history`, `announcements`, `reviews`, `app_settings`) |
| 6 | Supabase `service_role` key hanya diimport dari file server-only (`lib/supabaseAdmin.ts`, ditandai `import "server-only"`), tidak pernah dari komponen `"use client"` | OK |
| 7 | Password user di-hash dengan bcrypt sebelum disimpan, tidak pernah disimpan plaintext | OK |
| 8 | Session admin & user pakai cookie httpOnly + signed HMAC, bukan localStorage (aman dari XSS baca token) | OK |
| 9 | Middleware maintenance mode fail-open (tidak block seluruh situs jika Supabase sedang down) | OK by design |
| 10 | `.env.local` tidak ikut ke Git (ada di `.gitignore`) | OK |

## 🔍 Review 5 Flow (logika kode, bukan eksekusi nyata)

**Flow A: Guest Checkout → Generate QR → Webhook PAID → Status jadi success**
- `POST /api/qris/create` tidak mewajibkan login (mode tamu → `user_id: null`) — sesuai fitur 6.
- Order dibuat dengan status `pending`, `trx_id` 8 digit dicek unik sebelum dipakai.
- `POST /api/webhook/buatqris` mengubah status jadi `success` berdasarkan `trx_id`, bersifat idempoten (tidak overwrite status yang sudah final).
- `GET /api/qris/status` juga polling aktif ke upstream sebagai fallback jika webhook telat/gagal terkirim.
- **Risiko yang perlu kamu cek manual:** nama field response asli dari `api.buatqris.site` (`qris_string`, `ref_id`, dll di `lib/buatqris.ts`) adalah **asumsi** mengikuti pola API QRIS umum — saya tidak punya akses untuk memanggil API tersebut dan memverifikasi field sebenarnya. Jika field berbeda, sesuaikan mapping di `lib/buatqris.ts`.

**Flow B: Login Admin → Tambah Produk → Hapus Produk**
- Login admin membandingkan ke `ADMIN_USERNAME`/`ADMIN_PASSWORD` di env (bukan hardcode di source).
- `AdminProductManager.tsx` memanggil `POST /api/admin/products` (tambah) dan `DELETE /api/admin/products/[id]` (hapus), keduanya digated `requireAdmin()`.
- Alur logis konsisten: form → API → reload list.

**Flow C: SignUp → Login → Redeem Kode**
- Signup validasi password ≥ 8 karakter, cek username belum dipakai, hash bcrypt, lalu langsung `createUserSession`.
- Redeem (`/api/redeem`) mewajibkan session user, cek kuota & status aktif kode, serta constraint unik `(redeem_code_id, user_id)` di SQL mencegah redeem ganda di level database (bukan hanya di aplikasi).

**Flow D: Toggle Maintenance ON → User diarahkan ke halaman maintenance**
- Toggle disimpan ke tabel `app_settings`.
- `middleware.ts` mengecek status ini di setiap request non-admin/non-api dan redirect ke `/maintenance` bila aktif.
- Admin yang sedang login (punya cookie `ryuu_admin_session`) di-bypass agar tetap bisa mematikan maintenance dari panel.

**Flow E: Kirim Broadcast → Muncul popup di user**
- Admin submit lewat `POST /api/admin/broadcast` → tersimpan di `announcements`.
- `BroadcastPopup.tsx` (dirender di root layout, jadi muncul di semua halaman) fetch `GET /api/announcements/latest` saat mount, dan memakai `localStorage` (key `ryuu-seen-announcement`) supaya popup yang sama tidak muncul berulang ke user yang sudah menutupnya.

## ❗ Batasan & hal yang tidak bisa saya jamin dari sandbox ini

1. **Versi dependency di `package.json`** dipilih berdasarkan pengetahuan saya tentang versi stabil (Next 14.2.15, React 18.3.1, dst) per pelatihan saya — bukan hasil `npm install` sungguhan. Kemungkinan kecil ada versi lebih baru yang perlu `npm install` sesuaikan otomatis lewat `package-lock.json`, itu normal.
2. **Endpoint & format response `api.buatqris.site`** belum pernah saya panggil langsung (saya tidak punya akses jaringan). Mapping field di `lib/buatqris.ts` perlu dicocokkan ke dokumentasi resmi/response asli mereka.
3. **Belum ada test otomatis** (unit/e2e). Semua verifikasi di atas manual/statis.

## 📋 Yang perlu kamu lakukan setelah menerima project ini

1. `npm install && npm run build` di lokal — kirim error (jika ada) untuk saya perbaiki.
2. Jalankan `sql/SQL_SUPABASE.sql` di Supabase SQL Editor.
3. Isi environment variables di Vercel (lihat `.env.example`).
4. Test manual 5 flow di atas di environment staging sebelum benar-benar go-live.
5. **Rotate kredensial** yang sempat diketik di chat (lihat README.md bagian Keamanan).
