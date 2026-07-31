# Scalability & Security Strategy

## 1. Scalability Strategy

Sistem dirancang dengan asumsi akan menangani 100.000 pelanggan dan ratusan cabang barbershop. Strategi *scaling* berfokus pada pemecahan *bottleneck* (kemacetan).

### 1.1 Database Scalability
- **Connection Pooling:** Backend akan menggunakan connection pooler (misal: PgBouncer) jika koneksi melebihi batas PostgreSQL.
- **Indexing:** Kolom yang sering dicari (`customer_id`, `branch_id`, `booking_date`, status antrian) wajib diberi index.
- **Read/Write Split (Future):** Jika beban CMS (Read-Heavy) mengganggu transaksi Booking (Write-Heavy), database akan di-split menjadi Master (Write) dan Replicas (Read).

### 1.2 Queue Engine Scalability
- **Redis In-Memory:** Estimasi antrian dan jadwal harian (yang diakses real-time oleh ratusan orang) di-cache di Redis. Kalkulasi ulang antrian (ketika ada keterlambatan) dilakukan oleh Queue Worker di background secara asinkron.
- **Stateless API:** Backend Laravel bersifat *stateless*. Jika trafik naik, kita cukup menambah jumlah container PHP-FPM di belakang Load Balancer (Nginx).

### 1.3 AI Service Scalability
- **Asynchronous Processing:** Proses edit gambar memakan waktu 5-15 detik. Request ini **tidak memblokir** thread PHP HTTP. Request masuk ke Redis Queue, dikerjakan oleh Laravel Horizon/Worker, lalu hasilnya didorong kembali ke client via WebSockets (Laravel Reverb).
- **Rate Limiting AI:** Mencegah pembengkakan biaya (Cost Explosion) akibat bot atau spamming. Maksimal 5x generate AI per user per hari.

### 1.4 Frontend Scalability
- **Edge Caching:** Halaman publik (Landing Page, Artikel Blog) di-_build_ statis oleh Next.js dan di-cache di level CDN (Cloudflare). Trafik besar tidak akan menyentuh server VPS.

---

## 2. Security Architecture

### 2.1 Authentication & Authorization
- **JWT / Stateful Tokens:** Menggunakan Laravel Sanctum. Token disimpan aman di `HttpOnly Secure Cookies` untuk web, mencegah eksploitasi XSS.
- **Role-Based Access Control (RBAC):** Middleware ketat. Pelanggan dilarang keras mengakses endpoint `/api/admin/*`. Barber hanya bisa mengakses jadwal di cabang mereka sendiri (Row-Level Security / Multi-Tenancy concept).

### 2.2 Data Protection & Privacy
- **Image Privacy (Face Data):** Foto selfie pengguna yang diunggah untuk analisis AI diklasifikasikan sebagai PII (Personally Identifiable Information).
  - Foto *temporary* akan dihapus dari storage (via cron job) jika tidak disimpan oleh user.
  - URL foto menggunakan *signed URL* yang memiliki masa berlaku (expired), bukan *public URL*.
- **Database Encryption:** Kolom rahasia seperti password wajib menggunakan bcrypt/argon2 (standar Laravel).

### 2.3 API Security
- **Rate Limiting:** Diterapkan di level Nginx (throttle by IP) dan level Laravel (throttle by User ID).
- **CORS (Cross-Origin Resource Sharing):** Dibatasi hanya untuk domain frontend yang diizinkan.
- **Payload Validation:** Tidak ada data dari klien yang masuk ke sistem tanpa melewati Form Request Validation yang ketat (Zod di Frontend, Laravel Form Request di Backend). Mencegah Mass-Assignment vulnerabilities.

### 2.4 Operation Security
- **No Credentials in Code:** Semua secret (API Keys, DB password) disuntikkan via `.env` atau *Secret Manager* dari GitHub Actions.
- **Audit Logging:** Setiap perubahan di CMS (perubahan harga, penghapusan booking, perubahan rule AI) dicatat di tabel `audit_logs` (Siapa, Kapan, Apa yang diubah).
