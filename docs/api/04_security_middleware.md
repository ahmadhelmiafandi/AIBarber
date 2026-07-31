# Security, Middleware, & Auth Flow

## 1. Authentication Strategy

Menggunakan **Laravel Sanctum**. Token bersifat Stateful (Session/Cookie untuk Next.js di domain yang sama) atau Stateless (Bearer Token untuk Mobile App).

### 1.1 SPA Authentication Flow (Web)
1. Next.js menembak endpoint `/sanctum/csrf-cookie` untuk inisialisasi perlindungan CSRF.
2. Next.js mengirim POST `/api/v1/auth/login`.
3. Backend memvalidasi dan mengembalikan Cookie `XSRF-TOKEN` dan `laravel_session`.
4. Keamanan tinggi: Token tidak tersimpan di `localStorage` (XSS immune).

## 2. Middleware & RBAC (Role-Based Access Control)

Backend menggunakan package `spatie/laravel-permission` untuk pengamanan route.

### 2.1 Peta Otorisasi Route (Route Mapping)

```php
// Route API Definition

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Dapat diakses SEMUA user yang login (Customer, Barber, Admin)
    Route::get('/profile', [ProfileController::class, 'show']);
    
    // CUSTOMER ROUTES
    Route::middleware(['role:customer'])->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/ai/analyze', [AiConsultationController::class, 'analyze']);
    });
    
    // BARBER ROUTES
    Route::middleware(['role:barber'])->group(function () {
        Route::get('/barber/schedule', [BarberScheduleController::class, 'index']);
        Route::patch('/barber/queues/{id}/call', [QueueController::class, 'callNext']);
    });
    
    // ADMIN & OWNER ROUTES
    Route::middleware(['role:admin|owner'])->group(function () {
        Route::apiResource('/admin/barbers', AdminBarberController::class);
        Route::apiResource('/admin/services', AdminServiceController::class);
    });

    // OWNER ONLY ROUTES
    Route::middleware(['role:owner'])->group(function () {
        Route::get('/analytics/revenue', [RevenueController::class, 'index']);
        Route::get('/ai/costs', [AiCostController::class, 'index']);
    });
});
```

## 3. Data Isolation (Row-Level Authorization)

Selain melindungi *Route*, kita wajib melindungi *Baris Data* (Mencegah pelanggan membatalkan booking orang lain, atau barber memanggil antrian cabang lain).

- Menggunakan **Laravel Policies**.
- Contoh: `BookingPolicy::update(User $user, Booking $booking)`
  - Hanya akan return `true` jika `$user->id === $booking->customer_id`.
  - Jika `false`, Controller melemparkan respon `403 Forbidden`.

## 4. Rate Limiting (Throttle)

Didefinisikan di `app/Providers/RouteServiceProvider.php` atau Laravel 11/12 `bootstrap/app.php`.

- `api`: 60 requests / minute per IP.
- `ai_generation`: 5 requests / day per User ID. (Mencegah tagihan API jebol).
- `auth`: 5 attempts / minute per IP (Mencegah Brute Force).
