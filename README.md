# Kasflow - Catat Keuanganmu

**Version 1.0.3** - Feature Update ✨

Aplikasi pencatatan keuangan pribadi berbasis web yang ringan, cepat, dan bekerja secara offline. Dibangun dengan React dan menyimpan data langsung di browser menggunakan IndexedDB.

![Kasflow Preview](https://img.shields.io/badge/Status-Production-green) ![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue) ![Offline First](https://img.shields.io/badge/Offline-First-orange)

## Fitur Utama

### 💰 Manajemen Dana (Fund)
- **Multi Dana** - Pisahkan keuangan berdasarkan tujuan (Pribadi, Titipan, Usaha, Tabungan)
- **Dana Switcher** - Ganti profil Dana dengan cepat dari header
- **Global View** - Lihat total keseluruhan dengan mode "Semua Dana"
- **Dana Kustom** - Tambah, edit, atau hapus dana sesuai kebutuhan

### 💳 Multi Dompet (Wallet)
- Dukung berbagai jenis dompet: Tunai, Bank, E-Wallet
- Saldo otomatis terhitung dari transaksi
- Transfer antar dompet
- **Edit dompet** - Ubah nama dan tipe (saldo read-only)
- **Validasi hapus** - Dompet hanya bisa dihapus jika saldo = 0

### 📊 Pencatatan Transaksi
- Catat pemasukan, pengeluaran, dan transfer
- **Edit & hapus transaksi** - Klik transaksi di riwayat untuk mengedit
- Kategori yang dapat dikustomisasi
- Transfer antar dompet dengan tracking otomatis
- Catatan/note untuk setiap transaksi
- Penanggalan transaksi yang fleksibel

### 📈 Dashboard & Ringkasan
- Total saldo real-time
- Ringkasan pemasukan & pengeluaran bulanan
- Transaksi terakhir
- Filter otomatis berdasarkan Dana aktif
- Tampilan visual yang informatif dan menarik

### 🎨 UI & UX
- **Tema Gelap** - Opsi tampilan gelap untuk kenyamanan mata
- **Ukuran Tampilan** - Atur ukuran teks untuk kenyamanan penggunaan
- **Desain Mobile-First** - Antarmuka yang optimal untuk perangkat mobile
- **Interaksi Halus** - Animasi dan transisi yang menyenangkan
- **Toast Notifications** - Notifikasi visual untuk setiap aksi
- **Confirm Dialog Modern** - Dialog konfirmasi dengan desain modern

### 📱 PWA (Progressive Web App)
- **Installable** - Pasang seperti aplikasi native di perangkat
- **Offline-First** - Bekerja tanpa koneksi internet
- **Auto-Update** - Pembaruan otomatis saat versi baru tersedia
- **Install Prompt** - Panduan instalasi untuk pengalaman native-like

### 🔒 Privasi & Keamanan
- **100% Offline** - Data tersimpan di browser (IndexedDB)
- **Tanpa Server** - Tidak ada data yang dikirim ke internet
- **Backup/Restore** - Export dan import data dalam format JSON
- **Enkripsi Data** - Perlindungan data lokal di browser

## Tech Stack

- **Frontend:** React 19, Vite 7
- **UI Framework:** Tailwind CSS 4, PostCSS
- **State Management:** React Context + Custom Hooks
- **Database:** Dexie.js (IndexedDB wrapper), Dexie React Hooks
- **Icons:** Lucide React
- **Date:** date-fns
- **Utility:** clsx, uuid, tailwind-merge
- **Build Tools:** TypeScript 5.9, Vite PWA Plugin
- **CSS Processing:** PostCSS, Autoprefixer

## Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau pnpm

### Langkah Instalasi

```bash
# Clone repository
git clone <repository-url>
cd kasflow-new

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview
```

## Struktur Proyek

```
src/
├── components/              # Komponen utama aplikasi
│   ├── ui/                  # Komponen UI reusable
│   │   ├── ConfirmDialog.jsx # Dialog konfirmasi modern
│   │   └── TabSwitcher.jsx   # Komponen tab switcher
│   ├── BackupRestore.jsx    # Backup, restore & pengaturan
│   ├── Dashboard.jsx        # Halaman utama dengan ringkasan
│   ├── InstallPrompt.jsx    # Prompt instalasi PWA
│   ├── Toast.jsx            # Komponen notifikasi toast
│   ├── TransactionForm.jsx  # Form input transaksi (Dialog)
│   ├── TransactionHistory.jsx # Riwayat transaksi
│   └── WalletManager.jsx    # Kelola dompet
├── hooks/                   # Custom React hooks
│   ├── useBalance.js        # Hook kalkulasi saldo & transaksi
│   ├── useSettings.js       # Hook pengaturan aplikasi
│   └── useToast.js          # Hook manajemen toast notification
├── utils/                   # Utility functions
│   ├── formatters.js        # Format nominal & sorting kategori
│   └── helpers.js           # Helper functions umum
├── App.jsx                  # Komponen utama aplikasi
├── db.js                    # Konfigurasi database Dexie
├── index.css                # Styling utama dan dark mode
├── main.jsx                 # Entry point aplikasi
└── vite-env.d.ts            # Definisi tipe Vite
```

## Penggunaan

### Memilih Dana Aktif
1. Klik dropdown Dana di pojok kanan header
2. Pilih "Semua Dana" untuk melihat total keseluruhan
3. Pilih Dana spesifik (Pribadi, Titipan, dll) untuk filter tampilan

### Menambah Transaksi
1. Klik tombol **+** di tengah navigation bar
2. Pilih jenis: Pengeluaran / Pemasukan / Transfer
3. Masukkan nominal 
4. Dana otomatis mengikuti Dana aktif (atau pilih manual jika "Semua Dana")
5. Pilih kategori dan tambahkan catatan (opsional)
6. Klik "Simpan Transaksi"

### Edit/Hapus Transaksi
1. Buka tab **Riwayat**
2. Klik transaksi yang ingin diedit
3. Ubah data yang diperlukan atau klik "Hapus Transaksi"
4. Konfirmasi aksi di dialog yang muncul

### Mengelola Dompet
1. Buka tab **Dompet**
2. Klik dompet untuk mengedit nama atau tipe
3. Untuk menghapus, pastikan saldo = 0 terlebih dahulu

### Backup Data
1. Buka menu **Menu** (ikon gear)
2. Klik "Export Backup" untuk download file JSON
3. Simpan file backup di tempat aman

### Restore Data
1. Buka menu **Menu**
2. Klik "Import Backup" dan pilih file JSON
3. Data akan direstore ke aplikasi

## Default Kategori

**Pengeluaran:**
- Makan, Belanja, Transport, Tagihan, Kesehatan, Hiburan, Lainnya

**Pemasukan:**
- Gaji, Usaha, Investasi, Hadiah, Lainnya

## Default Dana

| Dana | Icon | Deskripsi |
|------|------|-----------|
| Pribadi | 💰 | Dana pribadi sehari-hari |
| Titipan | 🤝 | Dana titipan dari orang lain |
| Usaha | 💼 | Dana untuk keperluan usaha |
| Tabungan | 🎯 | Dana tabungan/target |

## PWA (Progressive Web App)

Aplikasi ini adalah Progressive Web App yang menyediakan pengalaman aplikasi native melalui browser web:

- **Installable** - Dapat dipasang di perangkat seperti aplikasi native
- **Offline-First** - Bekerja tanpa koneksi internet berkat service worker
- **Auto-Update** - Pembaruan otomatis saat versi baru tersedia
- **Install Prompt** - Notifikasi otomatis untuk instalasi aplikasi
- **Caching Efisien** - Assests penting di-cache untuk akses cepat

### Instalasi di Berbagai Platform

**Android (Chrome):**
- Buka aplikasi di browser Chrome
- Klik menu "Tiga titik" di pojok kanan atas
- Pilih "Install App" atau "Tambahkan ke layar utama"

**iOS (Safari):**
- Buka aplikasi di browser Safari
- Klik tombol "Share" (kotak dengan panah ke atas)
- Pilih "Add to Home Screen"
- Ketuk "Add"

## Pengaturan Tampilan

Aplikasi ini menyediakan beberapa opsi penyesuaian tampilan untuk kenyamanan pengguna:

### Mode Gelap
- Aktifkan atau nonaktifkan mode gelap sesuai preferensi
- Perlindungan mata saat penggunaan dalam kondisi cahaya rendah
- Pengaturan disimpan secara persisten

### Ukuran Tampilan
- Tersedia tiga opsi ukuran teks: Kecil, Sedang, dan Besar
- Sesuaikan dengan kebutuhan visual dan kenyamanan membaca
- Efek diterapkan secara real-time ke seluruh antarmuka

## Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run preview  # Preview hasil build
```

## Browser Support

Aplikasi ini mendukung browser modern yang support IndexedDB:
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

## Changelog

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk informasi lengkap tentang perubahan dari setiap versi.

---

**Kasflow** - Catat keuanganmu dengan mudah dan aman 💚
