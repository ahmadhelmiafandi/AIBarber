# API Contracts & REST Specification

Semua endpoint berbasis RESTful, menerima dan mengembalikan data dalam format JSON. Setiap *resource* memiliki versi (saat ini `/api/v1/`).

## 1. Authentication & Profil

### 1.1 POST `/api/v1/auth/login`
- **Fungsi:** Mendapatkan akses token (Sanctum).
- **Request:**
  ```json
  {
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "1|uuid...",
      "user": {
        "id": "uuid",
        "name": "Budi",
        "role": "customer"
      }
    }
  }
  ```

### 1.2 GET `/api/v1/profile/face-profile`
- **Fungsi:** Mengambil data profil wajah pelanggan (dari `customer_face_profiles`).
- **Authorization:** Bearer Token (Customer).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "face_shape": "Oval",
      "hairline": "M Shape",
      "hair_density": "Thick",
      "hair_texture": "Straight"
    }
  }
  ```

## 2. Booking & Queue

### 2.1 GET `/api/v1/booking-slots`
- **Fungsi:** Mendapatkan ketersediaan slot waktu untuk cabang, layanan, dan tanggal tertentu.
- **Query Params:** `branch_id`, `service_id`, `date`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "available_slots": ["09:00", "09:30", "11:00"]
    }
  }
  ```

### 2.2 POST `/api/v1/bookings`
- **Fungsi:** Membuat reservasi.
- **Request:**
  ```json
  {
    "branch_id": "uuid",
    "barber_id": "uuid",
    "service_id": "uuid",
    "booking_date": "2026-07-30",
    "booking_time": "09:00"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "booking_id": "uuid",
      "queue_number": "A-012",
      "estimated_start_time": "2026-07-30T09:15:00Z"
    }
  }
  ```

### 2.3 GET `/api/v1/queues/active`
- **Fungsi:** Mendapatkan status antrian *real-time* milik user (Polling / inisialisasi WebSocket).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "queue_code": "A-012",
      "status": "waiting",
      "people_ahead": 2,
      "estimated_arrival": "2026-07-30T09:00:00Z"
    }
  }
  ```

## 3. Enterprise AI Services

### 3.1 POST `/api/v1/ai/analyze`
- **Fungsi:** Upload foto dan mendeteksi wajah (Face Analysis Pipeline).
- **Request:** `multipart/form-data` (file `photo`).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "face_profile_id": "uuid",
      "analysis": {
        "face_shape": "Oval",
        "confidence": 0.98
      },
      "temporary_url": "https://s3.../temp.jpg"
    }
  }
  ```

### 3.2 GET `/api/v1/ai/recommendations`
- **Fungsi:** Mendapatkan rekomendasi berdasarkan ID profil wajah.
- **Query Params:** `face_profile_id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "recommendation_id": "uuid",
      "items": [
        {
          "hairstyle_id": "uuid",
          "name": "French Crop",
          "score": 95,
          "reason": "Sangat cocok untuk wajah Oval."
        }
      ]
    }
  }
  ```

### 3.3 POST `/api/v1/ai/preview` (Async Job)
- **Fungsi:** Generate virtual preview (Identity-Preserving). Membutuhkan *long-polling* atau WebSockets karena proses lama.
- **Request:**
  ```json
  {
    "recommendation_id": "uuid",
    "hairstyle_id": "uuid",
    "photo_url": "https://s3.../temp.jpg"
  }
  ```
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "message": "Preview sedang digenerate. Tunggu notifikasi.",
    "job_id": "uuid"
  }
  ```
*(Hasil akhir akan di-broadcast via Laravel Reverb)*
