# Migration Blueprint & Dependency Map

Pembuatan Migration (tabel) harus dieksekusi dengan urutan hierarki yang benar untuk mencegah *Foreign Key Constraint Violation*. Tabel referensi (tanpa FK) harus dibuat lebih dulu.

## 1. Migration Execution Order

```text
-- PHASE 1: Core Foundation (Independen)
1. 001_create_users_table (Tabel utama semua aktor)
2. 002_create_branches_table (Data cabang toko)
3. 003_create_services_table (Layanan dan durasi)
4. 004_create_hairstyles_table (Katalog gaya rambut utama)
5. 005_create_system_settings_table (Konfigurasi dinamis & feature flags)

-- PHASE 2: Actor & Master Extensions (Bergantung ke Phase 1)
6. 006_create_barbers_table (FK: users.id, branches.id)
7. 007_create_customer_profiles_table (FK: users.id, hairstyles.id)
8. 008_create_ai_rules_table (FK: hairstyles.id)

-- PHASE 3: Transactional (Bergantung ke Phase 2)
9. 009_create_bookings_table (FK: users.id, barbers.id, branches.id, services.id)

-- PHASE 4: Action & Event Driven (Bergantung ke Phase 3)
10. 010_create_queues_table (FK: bookings.id, branches.id)
11. 011_create_reviews_table (FK: bookings.id, users.id, barbers.id)
12. 012_create_ai_audit_logs_table (FK: users.id)
```

## 2. Foreign Key Drop Strategy (Rollback)

Fungsi `down()` pada migration Laravel harus menjatuhkan tabel dalam **urutan terbalik (Reverse Order)** dari penciptaannya.

```text
1. DROP TABLE ai_audit_logs;
2. DROP TABLE reviews;
3. DROP TABLE queues;
4. DROP TABLE bookings;
5. DROP TABLE ai_rules;
6. DROP TABLE customer_profiles;
7. DROP TABLE barbers;
8. DROP TABLE system_settings;
9. DROP TABLE hairstyles;
10. DROP TABLE services;
11. DROP TABLE branches;
12. DROP TABLE users;
```
*Tujuan:* Mencegah error "Cannot drop table because other objects depend on it".

## 3. Database Seeding Strategy

Seeder berfungsi untuk mempersiapkan data statis dan data *dummy* awal sistem. Urutan eksekusinya selaras dengan Migration Order.

1. **`RoleAndPermissionSeeder`**: Setup Spatie permissions (Super Admin, Owner, Barber, Customer).
2. **`UserSeeder`**: Membuat 1 akun SuperAdmin, 2 Owner, dan beberapa Dummy Customer.
3. **`BranchSeeder`**: Membuat 3 cabang dummy.
4. **`ServiceSeeder`**: Memasukkan layanan wajib dengan estimasi durasi pasti (Haircut 30m, Wash 15m, Coloring 120m, Spa 45m, Perm 180m).
5. **`HairstyleSeeder`**: Mengisi katalog gaya rambut standar (French Crop, Buzz Cut, dll) berserta JSON `suitable_face_shapes`.
6. **`BarberSeeder`**: Meng-assign beberapa user sebagai Barber ke cabang-cabang.
7. **`SystemSettingsSeeder`**: Menyuntikkan feature flag default (`ai_preview=true`, `ai_identity_threshold=0.95`).
8. **`AiRuleSeeder`**: Memasukkan bobot skor AI default.
9. **`BookingAndQueueSeeder`** (Khusus Environment Local): Generate dummy transaksi hari ini dan antrian yang sedang berjalan.
