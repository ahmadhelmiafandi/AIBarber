# Security, Audit & Data Retention Policy

## 1. Data Retention Policy (Siklus Hidup Data)

Mengingat volume data yang besar, kita tidak boleh menyimpan data operasional berukuran besar selamanya di database utama. Data lama harus dipindahkan (Archive) atau dihapus (Purge).

| Tipe Data | Kebijakan Retensi | Aksi Setelah Berakhir |
|---|---|---|
| **AI Audit Logs** | 2 Tahun | Dihapus permanen (Hard Delete) |
| **Bookings & Queues** | 5 Tahun | Diarsipkan ke *Cold Storage* (S3 CSV/Parquet) lalu Hard Delete |
| **Notifications** | 180 Hari | Dihapus permanen (Hard Delete) |
| **Session & Tokens** | 30 Hari | Hard delete (Automated via Laravel Sanctum pruning) |
| **Temporary AI Photos**| 24 Jam | Dihapus otomatis dari Object Storage jika user tidak "Save" |

## 2. Soft Delete Strategy

Tujuan utama *Soft Delete* adalah menjaga integritas *Foreign Key* pada data transaksi historis.

- **Diaktifkan Pada (Wajib Soft Delete):**
  - `users`, `barbers`, `branches`, `services`, `hairstyles`
  - *Alasan:* Jika Barber "Fadli" berhenti bekerja, data `barbers`-nya dihapus. Namun, `bookings` dari tahun lalu yang menunjuk ke Barber Fadli tidak boleh error.
- **Tidak Diaktifkan Pada (Wajib Hard Delete):**
  - `ai_audit_logs`, `queues`, `system_settings`, tabel *pivot*
  - *Alasan:* Mencegah pembengkakan ukuran database. Data histori antrian sudah tidak berguna secara transaksional setelah selesai, cukup Booking-nya yang dijaga.

## 3. Database Security & Encryption

### 3.1 Data Encryption at Rest & In Transit
- Koneksi aplikasi ke PostgreSQL wajib menggunakan SSL/TLS.
- Password user dienkripsi *one-way* menggunakan Bcrypt/Argon2.
- Data PII (Personally Identifiable Information) selain password tidak dienkripsi di level kolom database demi performa pencarian, namun database volume (AWS EBS / VPS disk) wajib terenkripsi.

### 3.2 System Level Security
- Database **TIDAK BOLEH** bisa diakses dari internet publik (`0.0.0.0`). PostgreSQL hanya membuka port `5432` khusus untuk subnet internal (jaringan internal Docker atau Private IP dari Application Server).
- Menggunakan kredensial database terpisah:
  - User `aibarber_app` (DML Only: SELECT, INSERT, UPDATE, DELETE).
  - User `aibarber_admin` (DDL Only: CREATE, ALTER, DROP) hanya digunakan saat menjalankan migration.

### 3.3 Application Level Security (Laravel)
- Model Eloquent dilarang menggunakan `$guarded = []`. Wajib mendefinisikan `$fillable` secara spesifik untuk mencegah *Mass Assignment Vulnerability*.
- Validasi eksistensi data (`exists:table,id`) wajib digunakan pada semua input Foreign Key dari API.

## 4. Multi-Tenant Strategy (Future Proofing)

Sistem didesain untuk satu brand Barbershop dengan multi-cabang (`branch_id`).
Jika berevolusi menjadi platform SaaS (multi-brand barbershop), maka:
1. Tidak perlu membuat database per-tenant (Terlalu mahal).
2. Tambahkan tabel `tenants` (id, name, domain).
3. Tambahkan kolom `tenant_id` ke tabel `branches` dan `users`.
4. Tabel lainnya seperti `bookings` dan `queues` sudah mengamankan hierarkinya via `branch_id`.
5. Semua query akan di-wrap oleh Laravel Global Scopes: `where('tenant_id', current_tenant_id)`.
