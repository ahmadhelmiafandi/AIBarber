# Logical Data Model & Data Dictionary

## 1. Naming Convention
- **Tables**: `snake_case`, jamak (plural). Contoh: `customers`, `ai_audit_logs`.
- **Columns**: `snake_case`, tunggal (singular). Contoh: `customer_id`, `is_active`.
- **Primary Keys**: `id` (Tipe: `UUID`, *Auto-generated* `uuid_generate_v4()`).
- **Foreign Keys**: `[singular_table_name]_id`. Contoh: `branch_id`.
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` (Tipe: `TIMESTAMP WITH TIME ZONE` / `TIMESTAMPTZ` dalam UTC).
- **Enums**: Ditulis dalam *snake_case* (misal: `waiting`, `on_service`).
- **Boolean**: Selalu diawali dengan `is_` atau `has_` (misal: `is_published`).

## 2. Table Definitions (Data Dictionary)

### 2.1 Users & Authentication

**Table: `users`**
*Deskripsi: Tabel autentikasi inti untuk semua pengguna (Admin, Barber, Customer).*
- `id` (UUID, PK)
- `name` (VARCHAR 100, NOT NULL)
- `email` (VARCHAR 150, UNIQUE, NOT NULL)
- `phone` (VARCHAR 20, UNIQUE, NULL)
- `password` (VARCHAR 255, NOT NULL)
- `role` (ENUM: `customer`, `barber`, `receptionist`, `admin`, `owner`, DEFAULT: `customer`)
- `status` (ENUM: `active`, `suspended`, `inactive`, DEFAULT: `active`)
- `email_verified_at` (TIMESTAMPTZ, NULL)
- `created_at`, `updated_at`, `deleted_at`

### 2.2 Master Data (Branches & Services)

**Table: `branches`**
*Deskripsi: Cabang barbershop untuk multi-branch architecture.*
- `id` (UUID, PK)
- `name` (VARCHAR 100, NOT NULL)
- `address` (TEXT, NOT NULL)
- `phone` (VARCHAR 20, NULL)
- `google_maps_url` (TEXT, NULL)
- `opening_hours` (JSONB, DEFAULT: '{}') -> Struktur: `{"monday": {"open": "09:00", "close": "21:00"}}`
- `is_active` (BOOLEAN, DEFAULT: true)
- `created_at`, `updated_at`, `deleted_at`

**Table: `services`**
*Deskripsi: Layanan yang ditawarkan beserta estimasi durasi untuk Queue Engine.*
- `id` (UUID, PK)
- `name` (VARCHAR 100, NOT NULL)
- `price` (DECIMAL 10,2, NOT NULL, CHECK >= 0)
- `estimated_duration_minutes` (INTEGER, NOT NULL, CHECK > 0)
- `description` (TEXT, NULL)
- `is_active` (BOOLEAN, DEFAULT: true)
- `created_at`, `updated_at`, `deleted_at`

### 2.3 Staff & Customers

**Table: `barbers`**
*Deskripsi: Profil spesifik untuk role barber.*
- `id` (UUID, PK)
- `user_id` (UUID, UNIQUE, FK -> users.id)
- `branch_id` (UUID, FK -> branches.id)
- `specialization` (VARCHAR 255, NULL)
- `rating_avg` (DECIMAL 3,2, DEFAULT: 0.00)
- `total_reviews` (INTEGER, DEFAULT: 0)
- `is_active` (BOOLEAN, DEFAULT: true)
- `created_at`, `updated_at`, `deleted_at`

**Table: `customer_profiles`**
*Deskripsi: Data preferensi pelanggan, terpisah dari tabel users agar tabel users tetap ringan.*
- `id` (UUID, PK)
- `user_id` (UUID, UNIQUE, FK -> users.id)
- `favorite_hairstyle_id` (UUID, FK -> hairstyles.id, NULL)
- `face_shape` (VARCHAR 50, NULL)
- `hairline` (VARCHAR 50, NULL)
- `hair_density` (VARCHAR 50, NULL)
- `hair_texture` (VARCHAR 50, NULL)
- `preference_notes` (TEXT, NULL)
- `created_at`, `updated_at`

### 2.4 Transactional (Booking & Queue)

**Table: `bookings`**
*Deskripsi: Data pemesanan jadwal potong rambut.*
- `id` (UUID, PK)
- `booking_code` (VARCHAR 20, UNIQUE, NOT NULL)
- `customer_id` (UUID, FK -> users.id)
- `barber_id` (UUID, FK -> barbers.id)
- `branch_id` (UUID, FK -> branches.id)
- `service_id` (UUID, FK -> services.id)
- `booking_date` (DATE, NOT NULL)
- `booking_time` (TIME, NOT NULL)
- `total_price` (DECIMAL 10,2, NOT NULL)
- `status` (ENUM: `pending`, `confirmed`, `completed`, `cancelled`, `no_show`)
- `cancellation_reason` (TEXT, NULL)
- `created_at`, `updated_at`

**Table: `queues`**
*Deskripsi: Data antrian realtime.*
- `id` (UUID, PK)
- `booking_id` (UUID, UNIQUE, FK -> bookings.id)
- `branch_id` (UUID, FK -> branches.id)
- `queue_number` (INTEGER, NOT NULL)
- `queue_code` (VARCHAR 10, NOT NULL) -> Misal: "A-015"
- `status` (ENUM: `waiting`, `checked_in`, `called`, `on_service`, `completed`, `skipped`, `cancelled`)
- `estimated_start_time` (TIMESTAMPTZ, NOT NULL)
- `estimated_finish_time` (TIMESTAMPTZ, NOT NULL)
- `actual_start_time` (TIMESTAMPTZ, NULL)
- `actual_finish_time` (TIMESTAMPTZ, NULL)
- `created_at`, `updated_at`
- *Composite Unique:* `(branch_id, booking_date, queue_number)`

### 2.5 AI Management & Audit

**Table: `hairstyles`**
*Deskripsi: Katalog potongan rambut.*
- `id` (UUID, PK)
- `name` (VARCHAR 100, NOT NULL)
- `category` (VARCHAR 50, NULL)
- `suitable_face_shapes` (JSONB, DEFAULT: '[]')
- `unsuitable_face_shapes` (JSONB, DEFAULT: '[]')
- `maintenance_level` (VARCHAR 50, NULL)
- `difficulty` (VARCHAR 50, NULL)
- `image_url` (TEXT, NULL)
- `created_at`, `updated_at`, `deleted_at`

**Table: `ai_rules`**
*Deskripsi: Aturan bobot rekomendasi.*
- `id` (UUID, PK)
- `face_shape` (VARCHAR 50, NOT NULL)
- `hairstyle_id` (UUID, FK -> hairstyles.id)
- `score_boost` (INTEGER, NOT NULL, DEFAULT: 0)
- `is_active` (BOOLEAN, DEFAULT: true)
- `created_at`, `updated_at`

**Table: `ai_audit_logs`**
*Deskripsi: Logging aktivitas AI untuk audit dan cost monitoring.*
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NULL)
- `operation_type` (VARCHAR 50, NOT NULL) -> `face_analysis`, `preview`, `chat`
- `model_used` (VARCHAR 100, NOT NULL)
- `engine_version` (VARCHAR 50, NOT NULL)
- `duration_ms` (INTEGER, NOT NULL)
- `similarity_score` (DECIMAL 4,3, NULL)
- `cost_usd` (DECIMAL 8,5, DEFAULT: 0.00000)
- `status` (VARCHAR 20, NOT NULL) -> `success`, `retry`, `failed`
- `request_payload` (JSONB, NULL)
- `response_payload` (JSONB, NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
