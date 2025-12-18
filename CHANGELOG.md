# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format ini berdasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-12-19

### Ditambahkan
- **Edit & Hapus Transaksi**: Klik transaksi di riwayat untuk mengedit atau menghapus
- **Edit Dompet**: Klik dompet untuk mengedit nama dan tipe (saldo tetap read-only)
- **Toast Notifications**: Notifikasi visual untuk semua aksi (tambah, edit, hapus)
- **Modern Confirm Dialog**: Dialog konfirmasi modern menggantikan browser confirm()
- **Format Nominal Otomatis**: Input nominal otomatis terformat dengan titik ribuan (1.000.000)
- **Komponen UI Reusable**: TabSwitcher, ConfirmDialog untuk konsistensi UI
- **Custom Hooks**: useToast untuk manajemen toast notifications
- **Utility Functions**: formatters.js dan helpers.js untuk kode yang lebih modular

### Diperbaiki
- **Persistensi Dark Mode**: Dark mode tidak lagi berubah saat mengganti profile dana
- **Kategori "Lainnya"**: Selalu muncul di posisi terakhir dalam daftar kategori
- **Validasi Hapus Dompet**: Dompet tidak bisa dihapus jika saldo ≠ 0

### Diubah
- **Refactoring Codebase**: Mengikuti prinsip KISS, DRY, dan Modularity
- **Dark Mode Contrast**: Peningkatan kontras untuk mode gelap
- **UX Color Consistency**: Warna hijau untuk aksi positif, merah untuk hapus/negatif

## [1.0.2] - 2025-12-16

### Ditambahkan
- **PWA Install Prompt**: Implementasi prompt instalasi aplikasi untuk pengalaman native-like
- **Service Worker Registration**: Registrasi service worker untuk fungsionalitas offline yang lebih kuat
- **Peningkatan Integrasi PWA**: Peningkatan pengalaman pengguna saat instalasi dan penggunaan offline

## [1.0.1] - 2025-12-16

### Ditambahkan
- **Implementasi PWA Lengkap**: Integrasi service worker, manifest.json, dan dukungan instalasi offline
- **Optimalisasi Performa Offline**: Pre-caching aset penting untuk pengalaman offline yang lancar
- **Ikon dan Branding PWA**: Aspek visual aplikasi web progresif untuk pengalaman native-app

### Diperbaiki
- **Keandalan Offline**: Memperbaiki caching strategi untuk akses data offline yang lebih baik
- **Pengalaman Pengguna PWA**: Memperbaiki installability dan integrasi dengan sistem operasi

## [1.0.0] - 2025-12-16

### Ditambahkan
- **Sistem Manajemen Keuangan Lengkap**: Aplikasi pelacak keuangan pribadi yang lengkap
- **Manajemen Multi-Dana**: Pisahkan keuangan berdasarkan tujuan (Pribadi, Usaha, Tabungan, dll.)
- **Dukungan Multi-Dompet**: Lacak akun tunai, bank, dan e-wallet
- **Kategori Kustom**: Kategorisasi pemasukan dan pengeluaran yang fleksibel
- **Dashboard Real-time**: Pelacakan saldo dan ringkasan bulanan
- **Mode Gelap**: Opsi tema gelap yang nyaman untuk mata
- **Offline First**: Data disimpan secara lokal di browser menggunakan IndexedDB
- **Cadangan & Pemulihan**: Fungsionalitas ekspor/impor JSON
- **Siap PWA**: Aplikasi web yang dapat diinstal dengan kemampuan offline
- **UI Responsif**: Desain mobile-first dengan interaksi yang halus

### Diubah
- **Rilis Stabil**: Versi siap produksi dengan fitur lengkap
- **Performa Dioptimalkan**: Pemrosesan dan rendering data yang efisien
- **UX Ditingkatkan**: Navigasi intuitif dan antarmuka yang ramah pengguna

### Keamanan
- **Berfokus pada Privasi**: Tidak ada data yang meninggalkan perangkat, semua disimpan secara lokal
- **Penyimpanan Aman**: Enkripsi IndexedDB dan perlindungan data

[1.1.0]: https://github.com/username/kasflow/releases/tag/v1.1.0
[1.0.2]: https://github.com/username/kasflow/releases/tag/v1.0.2
[1.0.1]: https://github.com/username/kasflow/releases/tag/v1.0.1
[1.0.0]: https://github.com/username/kasflow/releases/tag/v1.0.0