# 📸 Momentum Photobooth

[![Laravel Version](https://img.shields.io/badge/Laravel-v11.x-FF2D20?style=flat-square&logo=laravel)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-v8.2+-777BB4?style=flat-square&logo=php)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**Momentum Photobooth** adalah solusi sistem manajemen photobooth modern yang menghubungkan pengalaman pelanggan (upload & edit) dengan operasional mesin booth secara *real-time*. Dibangun dengan fokus pada performa tinggi, estetika premium, dan kemudahan integrasi pembayaran.

---

## ✨ Fitur Utama

### 👨‍👩‍👧‍👦 Sisi Pelanggan (Customer Flow)
- **Selection System**: Pilih berbagai template frame menarik dengan satu klik.
- **Advanced Editor**: Upload foto dan sesuaikan posisi (Geser, Zoom, Putar, Mirror) langsung di browser menggunakan `Moveable.js`.
- **Instant Code**: Dapatkan kode pesanan unik untuk digunakan langsung di mesin booth.

### 🤖 Sisi Mesin Booth (Kiosk Mode)
- **Silent Access**: Masuk ke sistem booth menggunakan token rahasia.
- **Seamless Payment**: Integrasi **Midtrans QRIS** untuk pembayaran instan di tempat.
- **Auto-Printing**: Sistem otomatis memicu pencetakan setelah pembayaran diverifikasi.
- **Kiosk Optimized**: Kursor otomatis tersembunyi dan UI dirancang untuk layar sentuh/kiosk.

### 📊 Dashboard Operator (Admin)
- **Live Statistics**: Pantau pendapatan, jumlah pesanan, dan status secara real-time.
- **Frame Management**: Tambah, hapus, dan atur template frame dengan mudah.
- **Reporting**: Data statistik harian yang di-reset otomatis setiap jam 12 malam WIB.

---

## 🛠️ Tech Stack

- **Backend**: [Laravel 11](https://laravel.com)
- **Database**: MySQL / MariaDB
- **Frontend**: Vanilla JS, [GSAP](https://greensock.com/gsap/) (Animations), [Moveable.js](https://daybrush.com/moveable/)
- **Payment Gateway**: [Midtrans API](https://midtrans.com)
- **Styling**: Momentum Design System (Pure CSS)

---

## 🚀 Instalasi Cepat

1. **Clone Repository**
   ```bash
   git clone https://github.com/mochhary/Momentum.git
   cd Momentum
   ```

2. **Install Dependensi**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Setup Database**
   Sesuaikan konfigurasi DB di `.env`, lalu jalankan migrasi:
   ```bash
   php artisan migrate --seed
   ```

5. **Jalankan Server**
   ```bash
   php artisan serve
   ```

---

## ⚙️ Konfigurasi Penting

Pastikan Anda mengisi variabel berikut di `.env` untuk fitur pembayaran:

```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Token rahasia untuk akses mesin booth
BOOTH_SECRET_TOKEN=KioskMomentum2K26

# Timezone (WIB)
APP_TIMEZONE=Asia/Jakarta
```

---

## 🖨️ Panduan Silent Printing (Kiosk Mode)

Untuk mengaktifkan pencetakan otomatis tanpa pop-up konfirmasi di mesin booth, jalankan browser Chrome dengan flag berikut:

- **Windows**: `chrome.exe --kiosk --kiosk-printing http://localhost:8000/booth?token=KioskMomentum2K26`
- **macOS**: `open -a "Google Chrome" --args --kiosk-printing`

---

## 📝 Lisensi

Proyek ini berada di bawah lisensi **MIT**. Silakan gunakan dan modifikasi sesuai kebutuhan Anda.

---

<p align="center">
  Dibuat dengan ❤️ oleh <strong>Moch Hary</strong>
</p>
