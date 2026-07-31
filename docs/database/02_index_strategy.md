# Indexing & Performance Strategy

Untuk menangani hingga 10 Juta Booking dan 100 Juta AI History tanpa full table scan, PostgreSQL memerlukan strategi index yang presisi.

## 1. Single Column Indexes (B-Tree)

Diterapkan pada kolom yang sering digunakan pada klausa `WHERE` atau `JOIN`.

| Table | Column | Index Name | Reason |
|---|---|---|---|
| `users` | `email` | `users_email_unique` (Unique) | Login & Lookups |
| `users` | `phone` | `users_phone_unique` (Unique) | Pencarian customer |
| `bookings`| `booking_code` | `bookings_code_unique` (Unique) | Validasi saat check-in |
| `bookings`| `customer_id` | `idx_bookings_customer_id` | Menampilkan History Pelanggan |
| `bookings`| `barber_id` | `idx_bookings_barber_id` | Menampilkan Jadwal Barber |
| `queues` | `booking_id` | `queues_booking_unique` (Unique) | Relasi 1:1 |
| `ai_audit_logs` | `user_id` | `idx_ai_logs_user_id` | Melacak kuota AI per user |

## 2. Composite Indexes

Diterapkan untuk query spesifik yang melibatkan klausa `WHERE` pada multi-kolom yang sering digabungkan, terutama untuk **Queue Engine**.

### 2.1 Booking & Scheduling Filter
- **Tabel:** `bookings`
- **Kolom:** `(branch_id, booking_date, status)`
- **Nama Index:** `idx_bookings_branch_date_status`
- **Alasan:** Dashboard Admin dan Barber terus-menerus mengeksekusi query: "Tampilkan booking di cabang X, hari ini, yang berstatus pending/confirmed".

### 2.2 Real-time Queue Tracking
- **Tabel:** `queues`
- **Kolom:** `(branch_id, status, queue_number)`
- **Nama Index:** `idx_queues_branch_status_number`
- **Alasan:** Queue Engine selalu mencari antrian aktif berikutnya: `WHERE branch_id = ? AND status = 'waiting' ORDER BY queue_number ASC LIMIT 1`.

### 2.3 AI Audit Timeline & Billing
- **Tabel:** `ai_audit_logs`
- **Kolom:** `(created_at, operation_type, status)`
- **Nama Index:** `idx_ai_logs_created_op_status`
- **Alasan:** Agregator billing bulanan akan men-query log berdasarkan rentang tanggal dan tipe operasi tanpa melakukan full table scan.

## 3. GIN Indexes (JSONB)

- **Tabel:** `hairstyles`
- **Kolom:** `suitable_face_shapes`
- **Index Type:** GIN
- **Nama Index:** `idx_hairstyles_suitable_shapes_gin`
- **Alasan:** Memungkinkan Recommendation Engine mencari gaya rambut: `SELECT * FROM hairstyles WHERE suitable_face_shapes @> '"Oval"'`.

## 4. Query Anti-Patterns (Dilarang Keras)
Sesuai *Query Guidelines*:
1. **Dilarang:** `SELECT * FROM ai_audit_logs WHERE created_at LIKE '2026-07%'` (Merusak index B-Tree).
   - **Solusi:** `WHERE created_at >= '2026-07-01' AND created_at < '2026-08-01'`.
2. **Dilarang:** N+1 pada list Booking.
   - **Solusi:** Menggunakan Eager Loading (Eloquent `with(['customer', 'barber'])`).
3. **Dilarang:** Menghitung total revenue menggunakan `SUM()` pada tabel `bookings` secara real-time di halaman dashboard utama.
   - **Solusi:** Gunakan tabel agregasi terpisah (`daily_revenue_reports`) yang di-update via cron/events.
