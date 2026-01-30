# SENTRA-DIGITAL
# Sistem Terpadu Digital Untuk Preventive Maintenance di PLTD Isolated System

Aplikasi manajemen pemeliharaan pembangkit listrik untuk PLTD Tahuna. Aplikasi ini membantu dalam monitoring jadwal pemeliharaan, pencatatan realisasi, dan manajemen profil unit pembangkit.

## Tech Stack

- **Framework**: Nuxt.js 3
- **Language**: JavaScript / Vue 3
- **Styling**: Custom CSS Design System (Responsive & Modern UI)
- **Database**: PostgreSQL
- **Authentication**: Google OAuth 2.0

## Fitur Utama

### 1. 📊 Dashboard
- Monitoring status pemeliharaan secara real-time.

### 2. 🏭 Profil Unit (`/profile`)
- Direktori lengkap 7 unit pembangkit.
- Detail spesifikasi teknis untuk:
  - **Mesin** (Swd, Deutz, Mitsubishi, Cummins)
  - **Generator**
  - **Transformator**

### 3. 📅 Preventive Maintenance (PM)
- **Jadwal Otomatis**: Penjadwalan berdasarkan siklus P1-P5.
- **Input Realisasi**: Form pencatatan hasil pemeliharaan.
- **Calendar View**: Tampilan kalender interaktif untuk histori dan jadwal.
- **Material**: Estimasi kebutuhan material per jenis PM.

### 4. 🔄 Periodik Overhaul (`/periodic`)
- **Monitoring Visual**: Progress bar real-time menuju target overhaul berikutnya (TO, SO, MO).
- **Baseline Calibration**: Fitur input "Realisasi Overhaul" untuk kalibrasi ulang jam operasi efektif.
- **Timeline Referensi**: Peta visual siklus overhaul untuk setiap tipe mesin.

### 5. 📦 Material Management
- Daftar stok material.
- Perencanaan kebutuhan material (Material Planning).

## Setup & Development

### Prasyarat
- Node.js (v18+)
- PostgreSQL Database

### Instalasi

```bash
# 1. Install dependencies
npm install

# 2. Setup Environment Variables
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda

# 3. Setup Database
# Jalankan script SQL yang ada di folder database/migrations/
# - 001_create_pm_realizations.sql
# - 002_create_overhaul_realizations.sql

# 4. Jalankan Development Server
npm run dev
```

### Build Production

```bash
# Build aplikasi
npm run build

# Start server produksi
npm run start
```

## Struktur Database (Penting)

Pastikan tabel-tabel berikut sudah dibuat di database PostgreSQL Anda agar fitur berjalan lancar:
1. `pm_realizations` & `pm_realization_materials` (Fitur Preventive)
2. `overhaul_realizations` (Fitur Periodik/Overhaul)

## Lisensi

© 2026 PLTD Tahuna
