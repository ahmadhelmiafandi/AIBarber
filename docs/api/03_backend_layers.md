# Backend Architecture Layers

Backend Laravel 12 pada proyek ini mengadopsi pola **Domain-Driven Design (DDD) Lite** atau *Modular Monolith*. Logika tidak boleh bertumpuk di Controller.

## 1. Layer Mapping

```text
app/
├── Http/
│   ├── Controllers/   (Layer 1: Entry Point)
│   ├── Requests/      (Layer 1: Validation)
│   └── Resources/     (Layer 1: Output Formatting / DTOs)
│
├── Services/          (Layer 2: Application / Business Logic)
│   ├── Booking/
│   ├── Queue/
│   ├── AI/
│   └── Master/
│
├── Models/            (Layer 3: Domain Entity)
│
├── Repositories/      (Layer 4: Database Abstraction)
│   └── Contracts/
│
├── Events/            (Layer 5: Event Driven Communications)
├── Listeners/
│
└── Jobs/              (Layer 6: Asynchronous Workers)
```

## 2. Tanggung Jawab Layer

### 2.1 Controllers (`app/Http/Controllers`)
- **Do:** Menerima request, memanggil `FormRequest` untuk validasi, memanggil *Service Layer*, mengembalikan respon JSON melalui `JsonResource`.
- **Don't:** Melakukan query `User::where(...)`, tidak ada perhitungan (if-else kompleks), tidak ada manipulasi data eksternal.

### 2.2 Services (`app/Services`)
- **Do:** Menampung **Business Logic**. Contoh: `BookingService::createBooking()`. Menghitung harga total, mengecek jadwal, mempublikasi *Event*.
- **Don't:** Mengembalikan respon HTTP, menyentuh format JSON frontend.

### 2.3 Repositories (`app/Repositories`)
- **Do:** Menangani kompleksitas kueri database (Eloquent builder, Raw SQL). Menyediakan antarmuka (Interface) agar Service tidak bergantung langsung pada Model spesifik.
- **Don't:** Melakukan validasi request, memproses logika bisnis (hanya ambil/simpan data).

### 2.4 Events & Listeners (`app/Events`)
- **Do:** Menjaga agar service terpisah (Decoupled).
  - Contoh: Setelah `BookingService` selesai, ia men-dispatch `BookingCreated`.
  - `QueueService` akan mendengarkan via `GenerateQueueNumberListener` dan menambahkan data ke tabel `queues`.
- **Don't:** Memanggil event di dalam loop yang panjang.

### 2.5 Jobs (`app/Jobs`)
- **Do:** Menangani proses berat (AI API calls, Image Storage) agar tidak memblokir respon HTTP pengguna.
- Contoh: `ProcessAiPreviewJob`.

## 3. Dependency Injection
Setiap Service harus disuntikkan (*injected*) ke Controller via Konstruktor untuk mempermudah Unit Testing (Mocking).

```php
class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}
    
    public function store(StoreBookingRequest $request) {
        $data = $this->bookingService->createBooking($request->validated());
        return response()->json(['success' => true, 'data' => $data], 201);
    }
}
```
