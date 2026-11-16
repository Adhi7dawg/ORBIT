# ORBIT — Sistem Manajemen Keuangan Pribadi

ORBIT adalah sistem manajemen keuangan pribadi modern yang menggabungkan estetika *Futuristic Space* pada halaman landing dengan gaya tipografi *Swiss International* dan *Neo-Brutalism* pada dashboard aplikasinya. Dibangun menggunakan arsitektur web ringan tanpa framework berat demi performa optimal dan kemudahan deployment statis melalui GitHub Pages.

---

## Fitur Utama

1. **Autentikasi Aman:** Sistem login dan registrasi berbasis Email & Password menggunakan Firebase Authentication.
2. **Dashboard Finansial Presisi:** Perhitungan total saldo, pemasukan bulanan, pengeluaran bulanan, dan net cash flow secara akurat.
3. **Manajemen Transaksi CRUD:** Tambah, ubah, hapus, cari, dan filter transaksi berdasarkan tipe maupun kategori dengan format mata uang Rupiah (IDR).
4. **Laporan Mingguan:** Navigasi periode mingguan berbasis kalender (Senin - Minggu) lengkap dengan rincian transaksi.
5. **Analisis Bulanan:** Visualisasi data interaktif menggunakan Chart.js (Donut Distribusi Pengeluaran & Grafik Tren Arus Kas).
6. **Siap Deployment GitHub:** Sepenuhnya statis tanpa memerlukan server Node.js dan siap di-host melalui GitHub Pages.

---

## Teknologi yang Digunakan

- **HTML5 & CSS3** (Vanilla Styling & Swiss Grid Layout)
- **JavaScript (ES6+ ES Modules)**
- **Firebase Authentication & Cloud Firestore**
- **Chart.js** (Visualisasi Data)

---

## Panduan Instalasi & Konfigurasi Firebase

### 1. Unduh atau Clone Repositori
```bash
git clone https://github.com/username/orbit.git
cd ORBIT
```

### 2. Setup Proyek Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Klik **Add project** dan buat proyek baru bernama **ORBIT**.
3. Daftarkan aplikasi Web baru (**Web App**) di dashboard proyek untuk mendapatkan objek konfigurasi Firebase.
4. Masuk ke menu **Authentication** > **Sign-in method**, lalu aktifkan penyedia **Email/Password**.
5. Masuk ke menu **Firestore Database** > **Create database**, pilih lokasi server terdekat, dan mulai dalam mode produksi (*production mode*).
6. Buka tab **Rules** di Firestore Database, lalu salin isi file `firestore.rules` dan klik **Publish**.

### 3. Masukkan Konfigurasi Firebase
Buka file `js/firebase.js` dan ganti placeholder dengan kredensial Web App Firebase Anda:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> **Catatan Keamanan:** Konfigurasi Web API Firebase memang dirancang untuk berada di sisi klien (*client-side*). Keamanan data pengguna sepenuhnya dijaga oleh Firebase Authentication dan **Firestore Security Rules** sehingga setiap pengguna hanya bisa mengakses datanya sendiri.

---

## Panduan Deployment ke GitHub Pages

1. Buat repositori baru di GitHub (misalnya bernama `orbit`).
2. Jalankan perintah berikut di dalam folder proyek `ORBIT`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit ORBIT"
   git branch -M main
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```
3. Di repositori GitHub Anda, buka menu **Settings** > **Pages**.
4. Pada bagian **Build and deployment**, ubah *Source* menjadi **Deploy from a branch**, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
5. Salin URL GitHub Pages Anda (misalnya `https://username.github.io/orbit/`), lalu buka **Firebase Console** > **Authentication** > **Settings** > **Authorized domains** dan tambahkan domain tersebut agar fitur login berjalan lancar.

---

## Lisensi
Didistribusikan di bawah Lisensi MIT.
