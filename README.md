# Kasflow - Catat Keuanganmu

**Version 1.0.2** - Production Ready ✨

Aplikasi pencatatan keuangan pribadi berbasis web yang ringan, cepat, dan bekerja secara offline. Dibangun dengan React dan menyimpan data langsung di browser menggunakan IndexedDB.

![Kasflow Preview](https://img.shields.io/badge/Status-Production-green) ![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue) ![Offline First](https://img.shields.io/badge/Offline-First-orange)

## Fitur Utama

### 💰 Manajemen Dana (Fund)
- **Multi Dana** - Pisahkan keuangan berdasarkan tujuan (Pribadi, Titipan, Usaha, Tabungan)
- **Dana Switcher** - Ganti profil Dana dengan cepat dari header
- **Global View** - Lihat total keseluruhan dengan mode "Semua Dana"

### 💳 Multi Dompet (Wallet)
- Dukung berbagai jenis dompet: Tunai, Bank, E-Wallet
- Saldo otomatis terhitung dari transaksi
- Transfer antar dompet

### 📊 Pencatatan Transaksi
- Catat pemasukan dan pengeluaran
- Kategori yang dapat dikustomisasi
- Transfer antar dompet dengan tracking otomatis
- Catatan/note untuk setiap transaksi

### 📈 Dashboard & Ringkasan
- Total saldo real-time
- Ringkasan pemasukan & pengeluaran bulanan
- Transaksi terakhir
- Filter otomatis berdasarkan Dana aktif

### 🔒 Privasi & Offline
- **100% Offline** - Data tersimpan di browser (IndexedDB)
- **Tanpa Server** - Tidak ada data yang dikirim ke internet
- **Backup/Restore** - Export dan import data dalam format JSON

## Tech Stack

- **Frontend:** React 19, Vite
- **UI Framework:** Shadcn UI, Tailwind CSS 4
- **State Management:** React Context + Hooks
- **Database:** Dexie.js (IndexedDB wrapper)
- **Icons:** Lucide React
- **Date:** date-fns

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
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── Dashboard.jsx        # Halaman utama dengan ringkasan
│   ├── TransactionForm.jsx  # Form input transaksi (Dialog)
│   ├── TransactionHistory.jsx # Riwayat transaksi
│   ├── WalletManager.jsx    # Kelola dompet
│   └── BackupRestore.jsx    # Backup & restore data
├── context/
│   └── SettingsContext.jsx  # Global settings context
├── hooks/
│   ├── useBalance.js        # Hook kalkulasi saldo & transaksi
│   └── useSettings.js       # Hook pengaturan aplikasi
├── lib/
│   └── utils.js             # Utility functions (cn, etc.)
├── db.js                    # Konfigurasi database Dexie
├── App.jsx                  # Komponen utama aplikasi
└── main.jsx                 # Entry point
```

## Penggunaan

### Memilih Dana Aktif
1. Klik dropdown Dana di pojok kanan header
2. Pilih "Semua Dana" untuk melihat total keseluruhan
3. Pilih Dana spesifik (Pribadi, Titipan, dll) untuk filter tampilan

### Menambah Transaksi
1. Klik tombol **+** di tengah navigation bar
2. Pilih jenis: Pengeluaran / Pemasukan / Transfer
3. Masukkan nominal dan pilih dompet
4. Dana otomatis mengikuti Dana aktif (atau pilih manual jika "Semua Dana")
5. Pilih kategori dan tambahkan catatan (opsional)
6. Klik "Simpan Transaksi"

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
