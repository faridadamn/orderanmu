# 📱 KasirPos Digital — Panduan Lengkap
### Sistem Pemesanan & Kasir Digital untuk Warung & Restoran Kecil

---

## Daftar Isi

1. [Apa itu KasirPos Digital?](#1-apa-itu-kasirpos-digital)
2. [Yang Kamu Dapatkan](#2-yang-kamu-dapatkan)
3. [Cara Setup (15 Menit)](#3-cara-setup-15-menit)
4. [Langkah 1 — Google Apps Script](#langkah-1--google-apps-script)
5. [Langkah 2 — Upload File ke Hosting](#langkah-2--upload-file-ke-hosting)
6. [Langkah 3 — Hubungkan Apps Script ke Aplikasi](#langkah-3--hubungkan-apps-script-ke-aplikasi)
7. [Langkah 4 — Kustomisasi Toko](#langkah-4--kustomisasi-toko)
8. [Cara Pakai Sehari-hari](#5-cara-pakai-sehari-hari)
9. [Fitur Admin Panel](#6-fitur-admin-panel)
10. [Tips & Trik](#7-tips--trik)
11. [FAQ](#8-faq)
12. [Dukungan](#9-dukungan)

---

## 1. Apa itu KasirPos Digital?

KasirPos Digital adalah sistem pemesanan dan kasir digital berbasis web yang dirancang khusus untuk warung makan, kafe kecil, dan usaha kuliner yang ingin go-digital tanpa biaya mahal.

**Tidak butuh:**
- Server berbayar
- Coding
- Aplikasi tambahan
- Biaya bulanan (gratis selamanya!)

**Cukup butuh:**
- Akun Google (gratis)
- Hosting gratis seperti GitHub Pages atau Netlify
- HP Android/iPhone untuk akses admin

---

## 2. Yang Kamu Dapatkan

| File | Fungsi |
|------|--------|
| `index.html` | Landing page toko — tampilkan menu, profil, dan ajak pelanggan pesan |
| `pesan.html` | Halaman pemesanan pelanggan — pilih menu, bayar, dapat nomor antrian |
| `admin.html` | Panel admin — proses pesanan, kelola stok, kirim invoice, dashboard penjualan |
| `Code.gs` | Backend Google Apps Script — database otomatis di Google Sheets |
| `manifest.json` | Konfigurasi PWA — agar bisa diinstall seperti aplikasi di HP |

### Fitur Lengkap

**Untuk Pelanggan (`pesan.html`)**
- Browse menu dengan kategori dan pencarian
- Tambah item ke keranjang dengan kontrol qty
- Isi data nama + nomor HP
- Pilih tipe pesanan: makan di tempat / bawa pulang
- Tambahkan catatan (misal: tanpa bawang, extra pedas)
- Nomor antrian digital tampil setelah konfirmasi

**Untuk Admin (`admin.html`)**
- Login dengan password
- Dashboard penjualan dengan grafik 7 hari
- Daftar pesanan real-time dengan filter status
- Proses pesanan: Pending → Diproses → Selesai
- Invoice otomatis dikirim setelah pesanan selesai
- Manajemen stok: restock, edit, hapus menu
- Tambah menu baru kapan saja
- Alert stok hampir habis / habis
- Auto-refresh setiap 30 detik

**Database (Google Sheets)**
- Sheet `Menu` — master data produk
- Sheet `Orders` — semua transaksi tersimpan permanen
- Sheet `OrderItems` — detail item per transaksi
- Sheet `QueueCounter` — penomoran antrian (reset tiap hari)
- Sheet `Config` — pengaturan toko

---

## 3. Cara Setup (15 Menit)

### Yang Dibutuhkan:
- [ ] Akun Google aktif
- [ ] File KasirPos Digital (sudah kamu terima)
- [ ] Akun hosting gratis (Netlify / GitHub Pages / InfinityFree)

---

## Langkah 1 — Google Apps Script

### 1.1 Buka Google Sheets

1. Buka [sheets.google.com](https://sheets.google.com)
2. Klik **"+ Blank"** untuk buat spreadsheet baru
3. Beri nama: **"KasirPos - [Nama Warungmu]"**

### 1.2 Buka Apps Script Editor

1. Di menu atas klik **Extensions** (atau **Ekstensi**)
2. Klik **Apps Script**
3. Tab baru terbuka — hapus semua kode yang ada di sana
4. **Copy semua isi file `Code.gs`** yang ada di paket ini
5. **Paste** ke editor Apps Script
6. Klik ikon **💾 Save** (atau Ctrl+S)
7. Beri nama project: **"KasirPos Backend"**

### 1.3 Jalankan Setup Awal

1. Di bagian atas editor, pastikan fungsi yang dipilih adalah **`testSetup`**
2. Klik tombol **▶ Run**
3. Akan muncul popup izin — klik **"Review permissions"**
4. Pilih akun Google kamu
5. Klik **"Advanced"** → **"Go to KasirPos Backend (unsafe)"**
6. Klik **"Allow"**
7. Tunggu sampai muncul dialog: **"✅ Setup selesai!"**

> Sekarang kamu akan lihat 5 sheet baru di Google Sheets: Menu, Orders, OrderItems, QueueCounter, Config.

### 1.4 Deploy sebagai Web App

1. Di Apps Script, klik **Deploy** (pojok kanan atas)
2. Pilih **"New deployment"**
3. Klik ikon ⚙️ di sebelah **"Select type"** → pilih **"Web app"**
4. Isi:
   - **Description:** KasirPos v1.0
   - **Execute as:** Me (your email)
   - **Who has access:** **Anyone** ← PENTING!
5. Klik **"Deploy"**
6. **Copy URL** yang muncul — terlihat seperti:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. Simpan URL ini, kamu akan butuhkan di langkah berikutnya!

---

## Langkah 2 — Upload File ke Hosting

### Pilihan A: Netlify (Termudah, Gratis)

1. Buka [netlify.com](https://netlify.com) → Sign up gratis
2. Di dashboard, cari kotak **"Deploy manually"**
3. **Drag & drop folder** yang berisi semua file HTML + manifest.json
4. Netlify akan memberikan URL seperti: `https://random-name-123.netlify.app`
5. Kamu bisa ubah nama di Settings → Domain Management

### Pilihan B: GitHub Pages (Gratis, Teknis Sedikit)

1. Buka [github.com](https://github.com) → Sign up gratis
2. Buat repository baru → nama bebas, centang "Public"
3. Upload semua file ke repository
4. Settings → Pages → Source: "Deploy from branch" → main → / (root)
5. URL akan jadi: `https://usernamekamu.github.io/nama-repo`

### Pilihan C: InfinityFree (Punya Domain .com)

1. Daftar di [infinityfree.com](https://infinityfree.com)
2. Buat hosting baru
3. Upload file via File Manager
4. Akses via subdomain gratis yang diberikan

---

## Langkah 3 — Hubungkan Apps Script ke Aplikasi

Setelah upload, kamu perlu memasukkan URL Apps Script ke dua file.

### 3.1 Edit `pesan.html`

Buka file `pesan.html`, cari baris ini (sekitar baris 200):

```javascript
const SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
```

Ganti menjadi:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

### 3.2 Lewat Admin Panel (Lebih Mudah)

Atau setelah upload, buka `admin.html` → masuk ke **Konfigurasi** → paste URL di kolom **"URL Google Apps Script"** → klik **Simpan**.

---

## Langkah 4 — Kustomisasi Toko

### Ubah Nama & Info Toko

Di file `index.html`, cari dan ganti:
- `Warung Makan Sejahtera` → nama warungmu
- `Jl. Raya No. 12, Jakarta` → alamatmu
- `021-5550123` → nomor HP/teleponmu
- `07.00 – 21.00` → jam operasionalmu

Di file `admin.html`, buka tab **Konfigurasi** dan isi semua field.

### Ubah Menu

Cara termudah: buka **Admin Panel** → tab **Stok & Menu** → klik **"+ Tambah Menu"** untuk tambah item baru, atau klik **Edit** untuk mengubah yang sudah ada.

### Ubah Password Admin

Default password: `admin123`

Ubah di Admin Panel → **Konfigurasi** → **Password Admin** → isi password baru → Simpan.

---

## 5. Cara Pakai Sehari-hari

### Alur Normal Setiap Hari

```
Pagi: Buka Admin Panel → Cek stok → Restock jika perlu

Siang: Pelanggan buka pesan.html → Pilih menu → Konfirmasi → Dapat nomor antrian

Admin: Dashboard auto-refresh → Klik "Proses" saat mulai masak → Klik "Selesai ✓" saat makanan siap → Invoice otomatis dikirim

Malam: Lihat Dashboard → Review penjualan hari ini → Cek stok untuk besok
```

### Bagikan ke Pelanggan

Setelah upload, share link `pesan.html` ke pelanggan melalui:
- **WhatsApp Status / Story**
- **Bio Instagram**
- **QR Code** (buat gratis di [qr-code-generator.com](https://qr-code-generator.com))
- **Papan nama fisik** dengan QR code di meja

---

## 6. Fitur Admin Panel

### Dashboard
Menampilkan ringkasan hari ini: pendapatan, jumlah pesanan selesai, pesanan menunggu, dan alert stok habis. Grafik batang menampilkan tren pendapatan 7 hari terakhir. Daftar 5 menu terlaris juga ditampilkan.

### Pesanan
Semua pesanan masuk tampil di sini dengan status:
- 🟡 **Menunggu** — pesanan baru dari pelanggan
- 🟠 **Diproses** — sedang dimasak / disiapkan  
- 🟢 **Selesai** — sudah selesai, invoice terkirim

Tombol aksi:
- **Proses** → ubah status menjadi "Diproses"
- **Selesai ✓** → ubah status menjadi "Selesai" + kirim invoice otomatis
- **Invoice** → lihat preview dan kirim ulang invoice
- **✕** → batalkan pesanan

### Stok & Menu
- Tabel semua menu dengan status stok (Aman / Menipis / Habis)
- Klik **Stok** → modal untuk set/tambah/kurangi stok
- Klik **Edit** → ubah nama, harga, deskripsi, kategori
- Klik **✕** → hapus menu
- Klik **+ Tambah Menu** → form tambah menu baru

### Konfigurasi
- URL Apps Script
- Nama, alamat, telepon toko
- Persentase PPN (default 11%)
- Mode invoice (otomatis / manual)
- Batas stok peringatan
- Password admin

---

## 7. Tips & Trik

### Agar Performa Terbaik

**Install sebagai Aplikasi (PWA)**
- Pelanggan: di browser HP klik menu → "Add to Home Screen" → nama "Warung Sejahtera"
- Admin: sama, untuk `admin.html`

**QR Code di Meja**
Buat QR code untuk `pesan.html` dan cetak di setiap meja. Pelanggan tinggal scan → pesan → bayar. Tanpa antre panjang!

**Stok Real-time**
Set stok produk setiap pagi di Admin Panel. Sistem otomatis kurangi stok saat ada pesanan masuk. Produk dengan stok 0 otomatis tampil "Habis" di halaman pesan.

### Integrasi Invoice via WhatsApp

Saat ini invoice dikirim via email jika pelanggan memasukkan alamat email. Untuk kirim otomatis via WhatsApp, kamu butuh layanan pihak ketiga:

**Fonnte (Terpopuler di Indonesia)**
1. Daftar di [fonnte.com](https://fonnte.com)
2. Hubungkan nomor WA
3. Di `Code.gs`, tambahkan kode berikut di fungsi `sendInvoice`:

```javascript
// Kirim WhatsApp via Fonnte
const FONNTE_TOKEN = 'TOKEN_FONNTE_KAMU';
const waMessage = `Halo ${order.nama}! 🙏\nBerikut invoice pesananmu:\n\nOrder: ${order.orderId}\nTotal: ${fmt(order.total)}\n\nTerima kasih sudah makan di ${config.store_name}!`;

UrlFetchApp.fetch('https://api.fonnte.com/send', {
  method: 'post',
  headers: { 'Authorization': FONNTE_TOKEN },
  payload: { target: order.hp, message: waMessage }
});
```

---

## 8. FAQ

**Q: Apakah data pesanan aman?**
Data tersimpan di Google Sheets akun Google kamu sendiri. Hanya kamu yang punya akses.

**Q: Apakah ada biaya?**
Tidak ada biaya untuk paket dasar. Google Apps Script dan Sheets gratis. Hosting bisa pakai Netlify atau GitHub Pages yang juga gratis.

**Q: Berapa banyak pesanan yang bisa ditangani?**
Google Apps Script punya batas 6 menit eksekusi per request dan 20.000 baris per spreadsheet. Cukup untuk ratusan pesanan per hari.

**Q: Nomor antrian reset kapan?**
Otomatis reset setiap hari. Jadi nomor antrian mulai dari 1 setiap hari buka.

**Q: Bisa pakai domain sendiri?**
Bisa. Upload ke hosting apapun yang support file HTML statis.

**Q: Bagaimana kalau internet mati?**
Aplikasi ini butuh internet untuk terhubung ke Apps Script. Namun data menu di-cache di browser, jadi halaman tetap bisa dibuka meski data tidak ter-refresh.

**Q: Bisa dipakai untuk lebih dari satu cabang?**
Bisa! Setup ulang untuk tiap cabang dengan spreadsheet berbeda dan URL Apps Script berbeda. Edit nama toko di masing-masing file HTML.

**Q: Apps Script error "You do not have permission"?**
Pastikan deployment di-set **"Who has access: Anyone"**. Jika masih error, coba deploy ulang sebagai deployment baru.

---

## 9. Dukungan

Jika kamu mengalami kendala dalam setup, pastikan kamu sudah:

1. ✅ Menjalankan `testSetup()` di Apps Script editor
2. ✅ Mendeploy sebagai Web App dengan akses **"Anyone"**
3. ✅ Menyalin URL Apps Script dengan benar ke `pesan.html` dan `admin.html`
4. ✅ Mengupload **semua** file (termasuk `manifest.json`) ke hosting

### Cek Koneksi Apps Script

Buka browser, kunjungi URL Apps Script kamu dan tambahkan `?action=getMenu`:

```
https://script.google.com/macros/s/XXXXX/exec?action=getMenu
```

Jika muncul JSON berisi data menu, berarti koneksi berhasil. ✅

---

*KasirPos Digital v1.0 — Dibuat dengan ❤️ untuk UMKM Indonesia*
