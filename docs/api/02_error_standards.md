# Error Standards & Validations

Agar *Frontend* dan *Mobile App* (di masa depan) mudah menangani *error*, seluruh respon API harus mematuhi struktur yang konsisten.

## 1. Standard Response Format

Seluruh JSON response (baik sukses maupun gagal) memiliki root struktur yang sama:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "errors": object | null,
  "meta": object | null
}
```

## 2. HTTP Status Codes

- **200 OK**: Request sukses (GET, PUT, DELETE).
- **201 Created**: Resource baru berhasil dibuat (POST).
- **202 Accepted**: Request diterima tapi diproses asinkron di *background job* (contoh: AI Preview).
- **400 Bad Request**: Permintaan tidak valid secara logika bisnis (misal: "Barber tidak tersedia di jadwal tersebut").
- **401 Unauthorized**: Token tidak ada, salah, atau kedaluwarsa.
- **403 Forbidden**: Token valid, tetapi role tidak memiliki akses (misal: Customer mengakses API Admin).
- **404 Not Found**: Data yang dicari tidak ada.
- **422 Unprocessable Entity**: Validasi form gagal (Input Validation).
- **429 Too Many Requests**: Terkena *Rate Limiting*.
- **500 Internal Server Error**: Bug atau kegagalan infrastruktur eksternal (Database down, API LLM mati).

## 3. Error Examples

### 3.1 Input Validation Error (422)
Dilemparkan oleh Laravel `FormRequest`.

```json
{
  "success": false,
  "message": "Input tidak valid.",
  "data": null,
  "errors": {
    "email": ["Email sudah digunakan."],
    "booking_date": ["Tanggal tidak boleh di masa lalu."]
  }
}
```

### 3.2 Business Logic Error (400)
Dilemparkan oleh Domain/Application Services menggunakan custom Exception (misal: `BookingUnavailableException`).

```json
{
  "success": false,
  "message": "Mohon maaf, slot waktu 09:00 sudah dibooking orang lain.",
  "data": null,
  "errors": null,
  "meta": {
    "error_code": "ERR_SLOT_TAKEN"
  }
}
```

### 3.3 AI Processing Error (503 / 400)
Dilemparkan oleh AI Gateway jika verifikasi identitas gagal (Similarity Score di bawah treshold).

```json
{
  "success": false,
  "message": "Gambar tidak memenuhi standar identitas (Wajah terlalu banyak berubah). Silakan coba dengan foto lain.",
  "data": null,
  "errors": null,
  "meta": {
    "error_code": "ERR_AI_IDENTITY_FAILED",
    "similarity_score": 0.82
  }
}
```

## 4. Validations Rule Standard (Backend)

Aturan yang wajib diterapkan pada setiap Request DTO:
- Dilarang mempercayai *input client*. Semua request POST/PUT wajib divalidasi.
- String selalu di-`trim`.
- File upload divalidasi ukurannya (max 5MB) dan MIME type-nya (`mimes:jpg,jpeg,png`).
- UUID divalidasi formatnya: `uuid` dan eksistensinya `exists:table,id`.
