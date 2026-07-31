# Architecture Decision Record (ADR)

Dokumen ini mencatat keputusan-keputusan arsitektur yang telah diambil, beserta alasannya, agar developer di masa depan memahami *konteks* di balik struktur kode.

---

### ADR-001: Penggunaan Next.js App Router
- **Status:** Accepted
- **Context:** Sistem membutuhkan SEO untuk halaman promosi (Landing Page, Blog), namun juga butuh dashboard interaktif seperti SPA.
- **Decision:** Menggunakan Next.js 15 App Router.
- **Consequence:** Kurva pembelajaran lebih tinggi karena konsep React Server Components (RSC). Komponen interaktif wajib ditandai `"use client"`.

### ADR-002: Pemisahan Frontend dan Backend (Decoupled)
- **Status:** Accepted
- **Context:** Tim menginginkan frontend yang snappy dan backend yang bisa diakses via Mobile App di masa depan.
- **Decision:** Membangun Next.js terpisah murni sebagai konsumen REST API, bukan menggunakan Laravel Blade / Inertia.js.
- **Consequence:** Harus mengelola dua repository/project, mengatur CORS, dan setup deployment terpisah.

### ADR-003: UI Framework menggunakan Tailwind + shadcn/ui
- **Status:** Accepted
- **Context:** PRD menuntut UI yang sangat custom, premium, bersih, bebas *template bloat*.
- **Decision:** Tidak menggunakan Bootstrap/AdminLTE. Menggunakan Tailwind v4 + shadcn/ui secara *copy-paste* komponen.
- **Consequence:** Mengendalikan desain secara absolut, namun tim harus memaintain komponen UI secara mandiri jika ada bug aksesibilitas.

### ADR-004: State Management via TanStack Query
- **Status:** Accepted
- **Context:** Dashboard Customer dan Barber banyak berinteraksi dengan API yang perlu sinkronisasi *cache* (Data Server).
- **Decision:** Membuang Redux. Menggunakan TanStack Query untuk *data fetching, caching, dan invalidation*.
- **Consequence:** Pengelolaan state klien murni mengandalkan *React useState/Context* sederhana, data server ditangani TanStack.

### ADR-005: Backend Framework menggunakan Laravel 12
- **Status:** Accepted
- **Context:** Kecepatan pengembangan backend (Time-to-Market) adalah prioritas, namun tetap butuh keandalan tinggi (Job Queue, ORM).
- **Decision:** Menggunakan Laravel 12 (PHP 8.4).
- **Consequence:** Struktur monolit modular di backend. Backend menangani tugas berat asinkron via Redis Queue.

### ADR-006: Algoritma Queue Engine di Backend
- **Status:** Accepted
- **Context:** Kalkulasi waktu tunggu (*Estimated Time*) harus akurat meski ada pembatalan atau *late show*.
- **Decision:** Logika estimasi antrian 100% ditempatkan di Backend. Frontend tidak melakukan kalkulasi, hanya menampilkan data.
- **Consequence:** Jika ada update jadwal, Backend harus mempublikasikan event ke WebSockets agar semua klien (Frontend) terupdate.

### ADR-007: Eksekusi AI via Queue (Asynchronous)
- **Status:** Accepted
- **Context:** Pemanggilan API AI eksternal (Image Generation) bisa memakan waktu 5-20 detik.
- **Decision:** Controller API HTTP merespon langsung dengan "Processing", dan melempar *Job* ke Queue. 
- **Consequence:** Frontend harus menerapkan mekanisme *polling* atau mendengarkan WebSockets untuk mendapatkan hasil gambar AI.

### ADR-008: Pembatasan Face Identity (Face Lock)
- **Status:** Accepted
- **Context:** Generative AI sering mengubah wajah asli pengguna. Ini melanggar *Core Principles AI*.
- **Decision:** Image generation harus diawali dengan *Masking/Segmentation* area rambut. Gambar akhir harus melewati verifikasi *Cosine Similarity* wajah sebelum diberikan ke user.
- **Consequence:** Biaya (API Cost) dan waktu (Latency) lebih tinggi karena butuh pipeline AI multi-step (Deteksi -> Segmentasi -> Generate -> Verifikasi).

### ADR-009: Penyimpanan Rule AI di Database (CMS)
- **Status:** Accepted
- **Context:** Pemilik barbershop ingin mengatur bobot gaya rambut tanpa harus menyuruh programmer mendepoy ulang (Misal: Oval + French Crop = +30 skor).
- **Decision:** Memindahkan AI Prompt dan Mapping Rule ke tabel Database (CMS). Backend membaca DB saat membangun *context* ke LLM.
- **Consequence:** CMS menjadi *Dynamic Prompt Builder*. Harus di-cache di Redis agar tidak membebani database setiap ada request AI.

### ADR-010: Skema Deployment dengan Docker Compose di aaPanel
- **Status:** Accepted
- **Context:** Mengurangi biaya infrastruktur (AWS/GCP terlalu mahal untuk awal). Hosting di VPS Niagahoster.
- **Decision:** Deploy menggunakan `docker-compose` melalui CI/CD GitHub Actions via SSH. aaPanel digunakan untuk reverse proxy dan SSL.
- **Consequence:** *Scaling horizontal* terbatas dalam batas satu VPS. Jika CPU/RAM VPS penuh, harus melakukan upgrade (Vertical Scaling) terlebih dahulu.
