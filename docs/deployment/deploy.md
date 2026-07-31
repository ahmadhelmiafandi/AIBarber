# Deployment Guide
# AI Smart Barbershop Management System

**Target:** VPS Niagahoster + aaPanel + Docker + GitHub Actions CI/CD

---

# 1. Arsitektur Deploy

```
GitHub Repository
       │
       ├── push backend/**  ──→  GitHub Actions  ──→  SSH ke VPS  ──→  rebuild backend container
       │
       └── push frontend/** ──→  GitHub Actions  ──→  SSH ke VPS  ──→  rebuild frontend container
```

Frontend dan backend **deploy terpisah**. Push perubahan di `backend/` hanya rebuild backend. Push perubahan di `frontend/` hanya rebuild frontend. Tidak perlu SSH manual untuk pull.

---

# 2. Struktur Docker

```
docker-compose.yml
├── postgres     (database)
├── redis        (cache & queue)
├── backend      (Laravel PHP-FPM)
├── frontend     (Next.js standalone)
└── nginx        (reverse proxy)
```

Nginx mengarahkan:
- `/api/*`, `/sanctum/*`, `/broadcasting/*` → backend (PHP-FPM port 9000)
- `/*` (sisanya) → frontend (Next.js port 3000)

---

# 3. Persiapan VPS

## 3.1 Install Docker di VPS

SSH ke VPS:

```bash
ssh root@IP_VPS -p PORT
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Install Docker Compose plugin:

```bash
sudo apt install docker-compose-plugin
```

Verifikasi:

```bash
docker --version
docker compose version
```

## 3.2 Install Git

```bash
sudo apt install git -y
```

## 3.3 Setup SSH Key untuk GitHub

Generate SSH key di VPS:

```bash
ssh-keygen -t ed25519 -C "deploy@vps"
cat ~/.ssh/id_ed25519.pub
```

Tambahkan output ke GitHub → Settings → SSH and GPG keys → New SSH key.

## 3.4 Clone Repository

```bash
mkdir -p /var/www
cd /var/www
git clone git@github.com:USERNAME/aibarber.git
cd aibarber
```

## 3.5 Setup Environment

Backend `.env`:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Isi yang wajib diubah:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=aibarber
DB_USERNAME=aibarber
DB_PASSWORD=PASSWORD_KUAT_DISINI

REDIS_HOST=redis
REDIS_PORT=6379

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

## 3.6 Jalankan Pertama Kali

```bash
cd /var/www/aibarber
docker compose up -d --build
```

Tunggu semua container running, lalu:

```bash
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan storage:link
```

Verifikasi:

```bash
docker compose ps
```

Semua container harus status `Up`.

---

# 4. Setup GitHub Actions CI/CD

## 4.1 Generate SSH Key untuk CI/CD

Di VPS, buat key khusus deploy:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions
```

Copy **private key** (output `cat ~/.ssh/github_actions`).

## 4.2 Tambah GitHub Secrets

Buka repository di GitHub → Settings → Secrets and variables → Actions → New repository secret.

Tambahkan:

| Secret Name | Value |
|---|---|
| `VPS_HOST` | IP address VPS |
| `VPS_USERNAME` | `root` (atau user lain) |
| `VPS_SSH_KEY` | Private key dari langkah 4.1 (seluruh isi file) |
| `VPS_PORT` | Port SSH (default `22`) |
| `PROJECT_PATH` | `/var/www/aibarber` |

## 4.3 Cara Kerja

File workflow ada di:

```
.github/workflows/deploy-backend.yml   → trigger saat push ke backend/**
.github/workflows/deploy-frontend.yml  → trigger saat push ke frontend/**
```

**deploy-backend.yml** melakukan:
1. SSH ke VPS
2. `git pull origin main`
3. `docker compose build backend`
4. `docker compose up -d backend`
5. `php artisan migrate --force`
6. Cache config, route, view
7. Restart nginx

**deploy-frontend.yml** melakukan:
1. SSH ke VPS
2. `git pull origin main`
3. `docker compose build frontend`
4. `docker compose up -d frontend`
5. Restart nginx

---

# 5. Aturan Deploy Terpisah

| Perubahan | Yang Terdeploy | Yang Tidak Terpengaruh |
|---|---|---|
| Edit file di `backend/` | Backend only | Frontend tetap jalan |
| Edit file di `frontend/` | Frontend only | Backend tetap jalan |
| Edit `docker-compose.yml` | Backend (trigger backend workflow) | Jalankan manual jika perlu full rebuild |
| Edit `nginx/` | Backend (trigger backend workflow) | - |

Ini diatur lewat `paths` filter di GitHub Actions:

```yaml
# deploy-backend.yml
on:
  push:
    paths:
      - 'backend/**'
      - 'docker-compose.yml'
      - 'nginx/**'

# deploy-frontend.yml
on:
  push:
    paths:
      - 'frontend/**'
```

---

# 6. Setup Domain & SSL di aaPanel

## 6.1 Tambah Website di aaPanel

1. Login aaPanel
2. Website → Add site
3. Domain: `domain.com`
4. Jangan buat database dari aaPanel (sudah pakai Docker PostgreSQL)

## 6.2 Setup Reverse Proxy

Di aaPanel, buka site config Nginx. Ganti seluruh isi dengan:

```nginx
server {
    listen 80;
    server_name domain.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Catatan:** Jika aaPanel Nginx dan Docker Nginx bentrok di port 80, ubah Docker Nginx ke port lain (misal `8080:80` di docker-compose.yml) dan arahkan proxy_pass ke `http://127.0.0.1:8080`.

## 6.3 SSL

Di aaPanel → SSL → Let's Encrypt → Issue certificate untuk domain.

---

# 7. Monitoring & Troubleshooting

## Lihat log container:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres
```

## Restart satu service:

```bash
docker compose restart backend
docker compose restart frontend
```

## Rebuild satu service:

```bash
docker compose build backend && docker compose up -d backend
docker compose build frontend && docker compose up -d frontend
```

## Full rebuild:

```bash
docker compose down
docker compose up -d --build
```

## Masuk ke container:

```bash
docker compose exec backend bash
docker compose exec frontend sh
```

## Jalankan artisan:

```bash
docker compose exec backend php artisan migrate:status
docker compose exec backend php artisan queue:work
```

---

# 8. Backup Database

## Manual backup:

```bash
docker compose exec postgres pg_dump -U aibarber aibarber > backup_$(date +%Y%m%d).sql
```

## Restore:

```bash
cat backup_20260729.sql | docker compose exec -T postgres psql -U aibarber aibarber
```

## Otomatis (cron di VPS):

```bash
crontab -e
```

Tambahkan:

```
0 2 * * * cd /var/www/aibarber && docker compose exec -T postgres pg_dump -U aibarber aibarber > /var/backups/aibarber_$(date +\%Y\%m\%d).sql
```

Backup setiap jam 2 pagi.

---

# 9. Environment Variables

## Backend (.env)

Semua konfigurasi Laravel standar. Yang penting untuk production:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATED_KEY
APP_URL=https://domain.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=aibarber
DB_USERNAME=aibarber
DB_PASSWORD=GANTI_PASSWORD

REDIS_HOST=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

## Frontend

Environment di docker-compose.yml:

```yaml
environment:
  NEXT_PUBLIC_API_URL: https://domain.com/api
```

---

# 10. Checklist Sebelum Live

- [ ] Domain sudah pointing ke IP VPS
- [ ] SSL sudah aktif
- [ ] `.env` backend sudah production mode
- [ ] `APP_DEBUG=false`
- [ ] Password database kuat
- [ ] GitHub Secrets sudah diisi semua
- [ ] `docker compose ps` semua container Up
- [ ] `php artisan migrate` sudah jalan
- [ ] `php artisan key:generate` sudah jalan
- [ ] Test akses `https://domain.com` (frontend)
- [ ] Test akses `https://domain.com/api` (backend)
- [ ] Backup database cron sudah aktif
