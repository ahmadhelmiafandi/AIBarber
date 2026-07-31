# Risk Analysis & Future Architecture

## 1. Risk Analysis & Mitigation

Sebuah sistem arsitektur tidak sempurna tanpa identifikasi risiko teknis. Berikut adalah *bottleneck* potensial dan strategi mitigasinya.

### 1.1 Risiko: AI Gateway API Timeout / Kegagalan Pihak Ketiga
- **Deskripsi:** API eksternal (OpenAI, Stable Diffusion, dll) mengalami downtime atau throttling.
- **Dampak:** Fitur Konsultan AI lumpuh, pengguna tidak bisa mem-preview gaya rambut. Booking tetap jalan.
- **Mitigasi:**
  - *Circuit Breaker Pattern:* Backend mendeteksi jika API AI gagal berulang kali, maka akan menghentikan request (Open Circuit) dan langsung mengembalikan pesan ramah "Layanan AI sedang sibuk" ke pengguna.
  - Tawarkan fallback ke rekomendasi *Rule-Based* statis tanpa generative preview.

### 1.2 Risiko: Kalkulasi Antrian Meleset (*Queue Drift*)
- **Deskripsi:** Barber memotong rambut lebih lama dari durasi estimasi di database (misal: Haircut harusnya 30 menit, realitasnya 45 menit).
- **Dampak:** Estimasi waktu pelanggan berikutnya menjadi tidak valid, menyebabkan antrian menumpuk secara fisik di toko.
- **Mitigasi:**
  - *Dynamic Queue Adjustment:* Ketika barber belum menekan tombol "Selesai" melebih batas durasi, Queue Engine secara otomatis mendeteksi keterlambatan dan memundurkan estimasi seluruh antrian di bawahnya, serta menembak notifikasi WebSocket/WA ke pelanggan yang terdampak.

### 1.3 Risiko: Double Booking (Concurrency)
- **Deskripsi:** Dua pelanggan (A dan B) mencoba membooking slot waktu yang sama di cabang yang sama tepat pada milidetik yang sama.
- **Dampak:** Bentrok jadwal barber, ketidakpuasan pelanggan.
- **Mitigasi:**
  - *Pessimistic Locking:* Backend Laravel (Database) menerapkan mekanisme `lockForUpdate()` saat mengecek slot kosong sebelum melakukan `INSERT`. Pelanggan B akan mendapat respon "Slot waktu sudah diambil orang lain".

### 1.4 Risiko: Biaya Image Generation Membengkak
- **Deskripsi:** User atau bot iseng melakukan request preview AI terus-menerus.
- **Dampak:** Tagihan layanan API pihak ketiga meledak (Denial of Wallet attack).
- **Mitigasi:**
  - Rate limiting via Redis (Maks. 5 request per hari per IP/User).
  - Gambar hasil preview dicache di S3. Jika user meminta gaya yang sama, jangan generate ulang, ambil dari cache.

---

## 2. Future Architecture (SaaS / Multi-Tenant Evolution)

Arsitektur MVP yang dibuat saat ini memiliki pondasi untuk berkembang menjadi layanan SaaS (Software as a Service) untuk banyak merek barbershop.

### 2.1 Multi-Tenancy Strategy (Single DB, Multi-Schema / Column)
- Saat ini sistem menggunakan tabel `branches` untuk cabang satu perusahaan.
- Untuk berevolusi menjadi SaaS, arsitektur akan beralih menggunakan pola `Tenant`. Setiap Barbershop akan memiliki `tenant_id`.
- Model Laravel akan menerapkan `Global Scope` berdasarkan `tenant_id` sehingga data antar perusahaan tidak bocor.

### 2.2 Microservices Spinoff
Jika trafik menjadi masif:
- **Queue Service** bisa dipisahkan menjadi microservice berbasis Go (Golang) untuk menangani jutaan koneksi WebSockets secara simultan dengan penggunaan memori yang jauh lebih kecil dibanding PHP.
- **AI Gateway** bisa dipisahkan menjadi server Python (FastAPI) agar bisa lebih dekat ke pemrosesan Machine Learning dan pengelolaan pipeline AI kustom.

### 2.3 Pembelajaran AI Internal (Proprietary Foundation Model)
Sesuai *AI Roadmap Phase 20*:
- Data foto pelanggan (sebelum dan sesudah) yang disimpan secara anonim di Object Storage akan membentuk *Data Lake*.
- Arsitektur akan bergeser dari bergantung pada *OpenAI/Gemini* (External API) menuju melatih *Custom Model* yang di-hosting sendiri di kluster GPU mandiri. Ini mengubah sistem dari sekadar pembungkus AI menjadi platform pemilik AI proprieter.
