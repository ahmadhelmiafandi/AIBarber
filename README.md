# AI Smart Barbershop Management System

Platform web modern yang mengintegrasikan Artificial Intelligence, Smart Queue Management, Online Booking, Customer Management, dan CMS dalam satu ekosistem untuk barbershop.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query |
| Backend | Laravel 12 (REST API) |
| Database | PostgreSQL 16 |
| Cache & Queue | Redis 7 |
| Realtime | Laravel Reverb |
| Auth | Laravel Sanctum |
| AI | Computer Vision, Recommendation Engine, OpenAI/Gemini, Image Editing AI |
| Deployment | Docker, Nginx, GitHub Actions CI/CD |

---

## Fitur Utama

- **AI Hair Consultant** — Analisis wajah, rekomendasi gaya rambut, virtual preview
- **Smart Booking** — Online booking dengan estimasi waktu otomatis
- **Smart Queue** — Antrian real-time dengan estimasi datang dan selesai
- **CMS** — Manajemen pelanggan, barber, cabang, layanan, hairstyle, promosi, blog
- **Barber Dashboard** — Jadwal, detail pelanggan, preferensi, portfolio
- **Owner Dashboard** — Analytics, revenue report, performa barber
- **Multi-Role** — Customer, Barber, Receptionist, Admin, Owner

---

## Struktur Folder

```
AIbarber/
├── .github/workflows/     # CI/CD (deploy-backend.yml, deploy-frontend.yml)
├── backend/               # Laravel 12 API
├── frontend/              # Next.js 15 App
├── nginx/                 # Reverse proxy config
├── docs/
│   ├── architecture/      # PRD, system architecture
│   ├── api/               # API documentation
│   ├── database/          # ERD, migrations
│   ├── deployment/        # Deploy guide
│   ├── uiux/              # Design system
│   └── ai/                # AI roadmap
├── skill/                 # Development skill guides (01-15)
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Cara Install

### Prerequisites

- Node.js 20+
- PHP 8.2+
- Composer
- PostgreSQL 16
- Redis 7
- Docker (opsional)

### Clone

```bash
git clone https://github.com/USERNAME/aibarber.git
cd aibarber
```

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Cara Menjalankan (Docker)

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan

docker compose up -d --build
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
```

Akses:
- Frontend: http://localhost
- API: http://localhost/api

---

## Environment

Salin `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Lihat `.env.example` untuk daftar variabel yang dibutuhkan.

---

## Deployment

Deploy menggunakan Docker + GitHub Actions CI/CD.

- Push ke `backend/` → otomatis deploy backend saja
- Push ke `frontend/` → otomatis deploy frontend saja

Detail lengkap: [docs/deployment/deploy.md](docs/deployment/deploy.md)

---

## AI Features

Pipeline AI:

```
Upload Photo → Face Analysis → Recommendation Engine → Virtual Preview → AI Chat
```

Detail: [docs/ai/AIroadmap.md](docs/ai/AIroadmap.md)

---

## License

Proprietary. All rights reserved.
