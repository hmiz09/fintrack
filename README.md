# FinTrack Rose - Smart Wealth & Expense Tracker

Aplikasi pencatatan keuangan pribadi, kartu kredit, dan portofolio aset (Saham IHSG & Emas) dengan antarmuka mobile-first bernuansa Rose-Pink elegan. Dibuat menggunakan React, TypeScript, Tailwind CSS, dan PWA (Progressive Web App).

---

## Fitur Utama

1. **Dashboard Cerdas & Ringkasan Ganda**:
   - Total Assets: Portofolio gabungan saham dan emas dengan indikator return P/L.
   - Total Cash: Saldo rekening/tunai dengan indikator dinamis **After CC** (saldo setelah tagihan kartu kredit bulan ini dibayar). Ketuk kartu untuk mengubah saldo.
2. **Grafik Pengeluaran Interaktif (Spending Chart)**:
   - Kurva spline kubik lebar penuh (full-width) dengan toggle mode Mingguan (W1, W2, W3, W4) dan Bulanan (Jun s/d Nov).
   - Skala sumbu Y ringkas (3M, 1.5M, 0) dan perbandingan dengan pengeluaran bulan sebelumnya.
3. **Manajemen Kartu Kredit (Cards Tab)**:
   - Kartu Available Limit dapat diketuk langsung untuk mengubah batas kredit kartu.
   - Kartu Due Date dapat diketuk langsung untuk mengatur tanggal jatuh tempo menggunakan swipe gesture atas/bawah atau stepper minus/plus.
   - Tombol **Pay Statement** untuk melunasi seluruh tagihan jatuh tempo bulan ini dalam satu ketukan dengan pemotongan kas otomatis.
   - Pelacakan cicilan transparan (Full, 3 bulan, 6 bulan, 12 bulan) dengan progress bar pembayaran.
4. **Input Transaksi Cepat dengan Keypad Kalkulator**:
   - Keypad 4x4 bawaan dengan operasi tambah, kurang, sama dengan, dan hapus digit secara langsung.
   - Pilihan kategori berikon duotone cerah dan chip catatan saran cepat.
   - Toggle instan antara pembayaran Tunai (Cash) dan Kartu Kredit (CC).
5. **Portofolio Aset Terpadu (Assets Tab)**:
   - Saham IHSG: Perhitungan lot x 100 lembar x harga pasar saat ini vs rata-rata beli.
   - Emas: Pemisahan emas fisik Antam dan emas digital (Spot) dengan harga acuan per gram.
6. **Penyimpanan Lokal & PWA**:
   - Data tersimpan privat dan aman di LocalStorage peramban tanpa perlu backend database berbayar.
   - Siap dipasang di layar utama iOS dan Android layaknya aplikasi native.

---

## Menjalankan di Komputer Lokal

### 1. Buka Proyek di Terminal
```bash
cd C:\Users\haris\.gemini\antigravity\scratch\fintrack
```

### 2. Jalankan Mode Pengembangan
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`. Buka di peramban dan tekan `F12` lalu pilih mode perangkat mobile untuk pengalaman terbaik.

---

## Membangun untuk Produksi (Build)

Jalankan perintah build untuk mengompilasi kode menjadi file statis HTML, CSS, dan JavaScript yang teroptimasi:

```bash
npm run build
```
Hasil build akan berada di dalam folder `dist/`.

---

## Panduan Deploy Online (100% Gratis)

### Pilihan 1: Deploy ke Vercel (Sangat Direkomendasikan)

#### Cara A (Menggunakan GitHub):
1. Buat repositori baru di akun GitHub Anda (misal: `fintrack`).
2. Masukkan proyek ke git dan push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit FinTrack"
   git branch -M main
   git remote add origin https://github.com/USERNAME/fintrack.git
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
4. Klik **Add New Project**, pilih repositori `fintrack`, lalu klik **Deploy**.
5. Vercel akan otomatis mendeteksi proyek Vite dan selesai dalam waktu kurang dari 1 menit dengan URL HTTPS publik gratis (contoh: `https://fintrack-rose.vercel.app`).

#### Cara B (Langsung dari Terminal lewat CLI):
```bash
npx vercel
```
Ikuti instruksi singkat di terminal untuk menghubungkan dan deploy langsung tanpa perlu push ke GitHub.

---

### Pilihan 2: Deploy ke Netlify atau Cloudflare Pages

1. Jalankan `npm run build` untuk menghasilkan folder `dist/`.
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop) atau dashboard Cloudflare Pages.
3. Seret (drag and drop) folder `dist/` ke halaman peramban.
4. Situs web Anda langsung aktif online dalam hitungan detik.

---

## Cara Pasang di Layar Utama HP (Install PWA)

Setelah website aktif di Vercel atau Netlify dengan link HTTPS:

### Di iPhone / iPad (Safari):
1. Buka tautan website Anda di peramban Safari.
2. Ketuk tombol **Bagikan (Share)** berupa ikon kotak dengan panah ke atas di bilah bawah.
3. Gulir ke bawah dan pilih **Tambahkan ke Layar Utama (Add to Home Screen)**.
4. Ketuk **Tambah (Add)**. Ikon FinTrack akan muncul di home screen iPhone Anda dan terbuka layar penuh tanpa address bar browser.

### Di HP Android (Chrome):
1. Buka tautan website di Google Chrome.
2. Ketuk tombol menu titik tiga di pojok kanan atas.
3. Pilih **Install app** atau **Tambahkan ke Layar Utama**.
4. Aplikasi akan terpasang di laci aplikasi HP Anda.
