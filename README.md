# <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/camera.svg" width="32" height="32" align="center"> Momentum Photobooth

<p align="center">
  <strong>Sistem Manajemen Photobooth Pintar dengan Integrasi QRIS & Editor Real-time.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-v11.x-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/PHP-v8.2+-777BB4?style=for-the-badge&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/MySQL-v8.0-4479A1?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Midtrans-Ready-003580?style=for-the-badge&logo=visa" alt="Midtrans">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/info.svg" width="24" height="24"> Tentang Proyek

**Momentum Photobooth** bukan sekadar aplikasi upload foto. Ini adalah ekosistem lengkap untuk bisnis photobooth mandiri. Aplikasi ini menjembatani celah antara keinginan pelanggan untuk mengedit foto mereka sendiri secara santai di smartphone mereka, dengan kecepatan proses cetak otomatis di mesin booth fisik.

### Mengapa Momentum?
- **User Empowerment**: Pelanggan tidak perlu terburu-buru di depan mesin. Mereka bisa upload, zoom, dan mengatur posisi foto dari HP masing-masing.
- **Kiosk Efficiency**: Mengurangi antrean di mesin fisik. Pelanggan datang ke booth hanya untuk scan kode dan membayar.
- **Revenue Ready**: Integrasi QRIS memastikan pembayaran masuk secara instan sebelum proses cetak dimulai.

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/list.svg" width="24" height="24"> Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Demo Visual](#-demo-visual)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Konfigurasi](#-konfigurasi)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" width="24" height="24"> Fitur Utama

### <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/smartphone.svg" width="20" height="20"> Alur Pelanggan (Web Mobile)
- **Editor Interaktif**: Geser, Zoom, Rotasi, dan Mirror foto secara real-time.
- **Multi-Frame Selection**: Berbagai pilihan template yang dikelola dari admin.
- **Code Generation**: Sistem kode unik untuk sinkronisasi data ke mesin booth.

### <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/monitor.svg" width="20" height="20"> Alur Booth (Kiosk Mode)
- **Silent Printing**: Cetak otomatis tanpa campur tangan operator.
- **Integrasi QRIS**: Verifikasi pembayaran otomatis dari Midtrans.
- **Kiosk Mode Optimized**: Antarmuka tanpa kursor, mendukung layar sentuh penuh.

### <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" width="20" height="20"> Panel Admin
- **Statistik Mendalam**: Pantau pendapatan harian, bulanan, dan tahunan.
- **Manajemen Frame**: Upload dan atur koordinat slot foto secara dinamis.
- **Reset Otomatis**: Statistik harian diperbarui tepat jam 12 malam WIB.

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/image.svg" width="24" height="24"> Demo Visual

| Halaman Pemilihan Frame | Editor Foto Mobile | Pembayaran QRIS |
| :---: | :---: | :---: |
| <img src="public/img/readme/selection.jpg" width="200" alt="Selection Page"> | <img src="public/img/readme/editor.jpg" width="200" alt="Mobile Editor"> | <img src="public/img/readme/payment.png" width="200" alt="QRIS Payment"> |

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/code.svg" width="24" height="24"> Teknologi

Aplikasi ini dibangun menggunakan tumpukan teknologi modern untuk memastikan performa dan skalabilitas:

<p align="left">
  <img src="https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript">
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git">
</p>

- **Backend Logic**: Laravel 12 dengan sistem arsitektur MVC yang bersih.
- **Frontend Animations**: GSAP untuk transisi antarmuka yang sangat halus.
- **Image Editor**: Moveable.js untuk manipulasi foto yang fleksibel.
- **Payment Gateway**: Midtrans Snap API untuk integrasi pembayaran QRIS yang aman.

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/download.svg" width="24" height="24"> Instalasi

Ikuti langkah berikut untuk menjalankan proyek secara lokal:

### 1. Persyaratan Sistem
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL 8.0+

### 2. Langkah Setup
```bash
# Clone repository
git clone https://github.com/mochhary/Momentum.git

# Install dependensi PHP
composer install

# Install & Build aset frontend
npm install
npm run build

# Salin environment file
cp .env.example .env
php artisan key:generate
```

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/settings.svg" width="24" height="24"> Konfigurasi

Pastikan Anda mengisi variabel berikut di `.env`:

```env
# Midtrans Credentials
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Timezone & Locale
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id

# Booth Security
BOOTH_SECRET_TOKEN=isi_token_anda_disini
```

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map.svg" width="24" height="24"> Roadmap
- [x] Integrasi Midtrans QRIS
- [x] Fitur Auto-Print (Silent)
- [x] Mode Foto (Color & B&W)
- [ ] Support Multi-Booth dalam satu Admin
- [ ] Fitur Filter Lanjutan (Sepia, Vivid, dsb)
- [ ] Integrasi Cloud Storage untuk Backup Foto

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/users.svg" width="24" height="24"> Kontribusi

Kontribusi selalu terbuka! Jika Anda memiliki ide atau menemukan bug, silakan buat *issue* atau kirimkan *pull request*.

1. Fork Proyek ini
2. Buat Branch Fitur (`git checkout -b fitur/Hebat`)
3. Commit Perubahan (`git commit -m 'Menambah fitur Hebat'`)
4. Push ke Branch (`git push origin fitur/Hebat`)
5. Buat Pull Request

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/file-text.svg" width="24" height="24"> Lisensi

Didistribusikan di bawah Lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  Dibuat dengan <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart.svg" width="16" height="16"> oleh <strong>Moch Hary</strong><br>
  Let's Capture Every Moment!
</p>
