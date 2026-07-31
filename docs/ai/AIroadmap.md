# Core AI Principles

Seluruh pengembangan AI pada platform ini harus mengikuti prinsip-prinsip berikut.

## Principle 1 — Face Identity Preservation

AI **tidak boleh mengubah identitas wajah pengguna**.

Preview hairstyle harus mempertahankan wajah asli pengguna semaksimal mungkin dan hanya mengubah area rambut.

Area yang **tidak boleh berubah**:

- Face shape
- Eyes
- Eyebrows
- Nose
- Mouth
- Lips
- Jawline
- Chin
- Ears
- Skin tone
- Facial proportions
- Facial expression
- Facial hair
- Camera angle
- Lighting
- Background (opsional)

Area yang **boleh berubah**:

- Hairstyle
- Hair length
- Hair volume
- Hair color (jika dipilih)
- Hair texture simulation
- Hair accessories (opsional)

---

## Principle 2 — Recommendation Before Generation

AI **tidak langsung membuat preview**.

Pipeline harus selalu:

Face Analysis

↓

Recommendation Engine

↓

Customer memilih hairstyle

↓

Hair Preview

Hal ini memastikan preview selalu berdasarkan rekomendasi yang memang sesuai.

---

## Principle 3 — Explainable Recommendation

Setiap rekomendasi harus memiliki alasan.

Contoh:

- Cocok untuk wajah oval
- Menyamarkan dahi lebar
- Mudah dirawat
- Cocok untuk pekerja kantoran

AI tidak boleh memberikan jawaban tanpa penjelasan.

---

## Principle 4 — Human-in-the-Loop

Feedback pengguna menjadi bagian dari proses pembelajaran.

Setiap rekomendasi dapat diberi:

- Like
- Dislike
- Rating
- Review

Seluruh feedback digunakan untuk meningkatkan Recommendation Engine.

---

# Identity-Preserving AI Pipeline

Pipeline utama AI.

```
Upload Photo

↓

Image Validation

↓

Face Detection

↓

Face Landmark Detection

↓

Hair Segmentation

↓

Hair Mask Generation

↓

Face Region Lock

↓

Face Feature Extraction

↓

Recommendation Engine

↓

Customer Select Hairstyle

↓

Hair Editing Model

↓

Identity Verification

↓

Quality Validation

↓

Final Preview
```

---

# Face Lock Engine

Face Lock Engine bertugas mengunci seluruh area wajah.

## Protected Region

- Eyes
- Nose
- Mouth
- Jawline
- Chin
- Eyebrows
- Beard
- Skin
- Face Shape

## Editable Region

- Hair

Model AI tidak boleh menghasilkan perubahan di luar Hair Mask.

---

# Identity Verification Engine

Setelah proses image editing selesai.

AI wajib membandingkan wajah asli dengan wajah hasil editing.

Pipeline

```
Original Image

↓

Face Embedding

↓

Generated Image

↓

Face Embedding

↓

Cosine Similarity

↓

Threshold Validation
```

Threshold

| Similarity | Result |
|------------|--------|
| ≥ 0.98 | Perfect |
| 0.95–0.98 | Accept |
| 0.90–0.95 | Retry |
| < 0.90 | Reject |

Jika similarity kurang dari threshold maka preview harus dibuat ulang.

---

# Evaluation Metrics

| Metric | Target |
|----------|---------|
| Face Identity Similarity | ≥ 0.98 |
| Face Shape Preservation | 100% |
| Facial Landmark Shift | < 1% |
| Hair Segmentation IoU | ≥ 98% |
| Hair Editing Accuracy | ≥ 95% |
| Recommendation Accuracy | ≥ 90% |
| User Satisfaction | ≥ 4.5 / 5 |

---

# Updated AI Roadmap

## Phase 0 — Rule-Based Foundation

### Objective

Membangun pondasi Recommendation Engine.

### Deliverables

- Hairstyle Database
- Face Shape Database
- Hair Texture Database
- Hairline Database
- Rule Engine
- Recommendation Rules

Belum menggunakan AI.

---

## Phase 1 — Computer Vision

### Objective

Mendeteksi karakteristik wajah.

### Deliverables

- Face Detection
- Face Landmark
- Hair Detection
- Hairline Detection
- Face Shape Detection
- Hair Density Detection
- Hair Texture Detection

Output berupa JSON.

---

## Phase 2 — Face Lock Engine

### Objective

Membangun sistem penguncian wajah.

### Deliverables

- Hair Segmentation
- Hair Mask
- Editable Region
- Protected Region
- Face Lock Engine

Output:

AI hanya boleh mengubah area rambut.

---

## Phase 3 — Recommendation Engine

### Objective

Menghasilkan rekomendasi hairstyle.

Pipeline

```
Face Analysis

↓

Rule Engine

↓

Scoring Engine

↓

Top Recommendation
```

Belum menggunakan LLM.

---

## Phase 4 — AI Hair Consultant

### Objective

Menambahkan AI Chat.

LLM hanya menjelaskan hasil Recommendation Engine.

---

## Phase 5 — Identity-Preserving Hair Preview

### Objective

Membuat simulasi hairstyle.

Pipeline

```
Hair Mask

↓

Image Editing

↓

Identity Verification

↓

Quality Validation

↓

Preview
```

Face tidak boleh berubah.

---

## Phase 6 — Feedback Learning

AI mulai belajar dari:

- Rating
- Review
- Hairstyle dipilih
- Repeat Booking

---

## Phase 7 — Personalization

AI mengenali preferensi pelanggan.

- Favorite hairstyle
- Favorite barber
- Haircare preference
- Styling preference

---

## Phase 8 — Proprietary Dataset

Mulai membangun dataset internal.

Target:

- 100 foto
- 1.000 foto
- 10.000 foto
- 100.000 foto
- 1.000.000 foto

Dataset menjadi Intellectual Property perusahaan.

---

## Phase 9 — Machine Learning Recommendation

Rule Engine digantikan Machine Learning.

Model belajar dari:

- Feedback
- Rating
- Booking
- Repeat Customer
- Hairstyle dipilih

---

## Phase 10 — Fine-Tuned Hair Consultant

Melatih LLM menggunakan dataset konsultasi barber profesional.

---

## Phase 11 — Custom Hair Editing Model

Mulai melatih model image editing sendiri.

Arsitektur

```
Identity Encoder

+

Hair Encoder

+

Hair Decoder
```

Model mulai memahami konsep Identity Preservation.

---

## Phase 12 — Identity Loss Training

Menambahkan loss function khusus.

Loss yang digunakan:

- Identity Loss
- Landmark Loss
- Hair Segmentation Loss
- Perceptual Loss
- Reconstruction Loss

Model dihukum jika mengubah wajah.

---

## Phase 13 — Hair Health AI

Mendeteksi:

- Hair Loss
- Hair Thickness
- Hair Damage
- Dry Scalp
- Oily Scalp

---

## Phase 14 — Temporal Analysis

Menganalisis perubahan rambut dari waktu ke waktu.

---

## Phase 15 — Predictive AI

AI memprediksi:

- Waktu terbaik haircut berikutnya
- Potensi perubahan gaya rambut
- Rekomendasi perawatan

---

## Phase 16 — Long-Term Memory

AI mengingat histori pelanggan.

---

## Phase 17 — Knowledge Graph + RAG

Menggabungkan:

- Hairstyle Knowledge Base
- Haircare Knowledge
- Portfolio
- Blog
- Customer History

---

## Phase 18 — AI Agent

AI mampu menjalankan seluruh workflow secara otomatis.

---

## Phase 19 — Reinforcement Learning

Model belajar dari hasil nyata.

Reward:

- Customer puas
- Booking berhasil
- Repeat Customer

Penalty:

- Recommendation ditolak
- Rating rendah

---

## Phase 20 — Proprietary Hair Foundation Model

Melatih foundation model sendiri menggunakan jutaan data internal.

Output:

- Face Analysis
- Hairstyle Recommendation
- Hair Health Analysis
- Identity-Preserving Hair Editing
- Personalized Hair Consultant

Platform tidak lagi bergantung sepenuhnya pada model AI pihak ketiga.

Saya juga menyarankan satu perubahan penting pada roadmap: pisahkan Recommendation Engine dan Image Editing Engine sebagai dua produk AI yang berbeda. Banyak produk saat ini langsung meminta model generatif membuat gambar baru, sehingga identitas wajah berubah. Dengan memisahkan keduanya, Recommendation Engine bertugas menentukan gaya rambut terbaik, sedangkan Image Editing Engine hanya memvisualisasikan pilihan tersebut sambil mempertahankan identitas wajah. Arsitektur ini lebih mudah dikembangkan, diuji, dan memiliki nilai penelitian yang lebih kuat.