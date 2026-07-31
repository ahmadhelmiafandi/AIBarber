# Frontend Design Guidelines
# AI Smart Barbershop Management System

**Version:** 1.0  
**Status:** Design System  
**Last Updated:** July 2026

---

# 1. Design Philosophy

## Core Principles

Desain harus memberikan kesan:

- Premium
- Modern
- Professional
- Editorial
- Clean
- Minimal
- Masculine
- Trustworthy
- Human-centered

AI bukan identitas visual utama.

Pengguna harus merasa menggunakan **platform barbershop premium**, bukan website AI yang dipenuhi efek futuristik.

---

# 2. Design Goals

Website harus:

- Mudah dipahami pertama kali
- Fokus pada konten
- Memiliki visual hierarchy yang jelas
- Menggunakan whitespace secara optimal
- Responsif di seluruh perangkat
- Memiliki loading cepat
- Menghindari visual yang berlebihan

---

# 3. Design Direction

## Inspiration

- Apple
- Linear
- Raycast
- Vercel
- Stripe
- Framer
- Notion
- Arc Browser

Bukan:

- AI SaaS Template
- Crypto Dashboard
- Cyberpunk UI
- Neon UI

---

# 4. What We Avoid

Jangan menggunakan:

- Glow berlebihan
- Background gradient penuh
- Blob animation
- Floating shapes
- Neon
- Glassmorphism berlebihan
- Card terlalu banyak
- Border warna-warni
- Font futuristik
- Animasi yang mengganggu
- Visual AI yang dipaksakan

---

# 5. Color System

## Primary

```css
#111111
```

---

## Secondary

```css
#555555
```

---

## Muted

```css
#888888
```

---

## Background

```css
#FAFAFA
```

---

## Surface

```css
#FFFFFF
```

---

## Border

```css
#E5E7EB
```

---

## Success

```css
#22C55E
```

---

## Warning

```css
#F59E0B
```

---

## Danger

```css
#EF4444
```

---

## Accent

Gunakan warna natural.

Contoh:

```css
#8B5E3C
```

atau

```css
#B78628
```

Accent digunakan seperlunya untuk CTA atau elemen premium.

---

# 6. Dark Mode

Background

```css
#0E0E0E
```

Surface

```css
#161616
```

Text

```css
#FFFFFF
```

Border

```css
#2B2B2B
```

---

# 7. Typography

## Heading

Geist

Alternatif:

- SF Pro Display
- Inter Tight

---

## Body

Inter

Alternatif:

- Manrope

---

## Monospace

Geist Mono

---

## Font Scale

| Type | Size |
|--------|---------|
| Hero | 64px |
| H1 | 48px |
| H2 | 40px |
| H3 | 32px |
| H4 | 24px |
| H5 | 20px |
| Body Large | 18px |
| Body | 16px |
| Small | 14px |
| Caption | 12px |

---

# 8. Layout

Container

```
1200px
```

Maximum

```
1280px
```

Grid

```
12 Columns
```

---

# 9. Spacing

Gunakan sistem 8pt.

```
4
8
12
16
24
32
40
48
64
80
96
```

---

# 10. Border Radius

Small

```
12px
```

Card

```
20px
```

Large Card

```
24px
```

Button

```
14px
```

Avatar

```
999px
```

---

# 11. Border

Gunakan border tipis.

```
1px solid #E5E7EB
```

---

# 12. Shadow

Gunakan soft shadow.

```css
box-shadow:
0 8px 30px rgba(0,0,0,.06);
```

Hindari glow.

---

# 13. Icons

Gunakan:

- Lucide
- Heroicons

Jangan menggunakan icon 3D.

---

# 14. Images

Gunakan:

- Foto asli barber
- Foto hasil haircut
- Foto interior barbershop

Jangan:

- AI Portrait
- Fake People
- Stock photo yang terlalu generik

---

# 15. Motion

Gunakan motion sederhana.

Durasi:

```
200ms
```

Maksimum:

```
350ms
```

Jenis animasi:

- Fade
- Slide
- Scale

Hindari:

- Bounce
- Rotate
- Flash
- Glow

---

# 16. Landing Page Structure

## Hero

```
Headline

↓

Subheadline

↓

Primary CTA

↓

Secondary CTA

↓

Application Preview
```

---

## AI Process

Gunakan timeline.

```
Upload

↓

Analyze

↓

Recommend

↓

Preview

↓

Book
```

---

## Features

Grid 2 kolom.

Contoh

```
AI Consultation

Virtual Preview

Smart Booking

Realtime Queue

Hair History

Portfolio
```

---

## Statistics

```
1000+

Hair Analysis

500+

Happy Customers

95%

Recommendation Accuracy

20+

Professional Barbers
```

---

## Testimonials

Gunakan card sederhana.

```
Avatar

Nama

Rating

Review
```

---

## CTA

Section terakhir.

```
Find Your Next Hairstyle

Start Free Analysis

Book Appointment
```

---

# 17. Customer Dashboard

Layout

```
Sidebar

Main Content
```

Sidebar

```
Dashboard

AI Consultant

Booking

Queue

History

Favorites

Membership

Settings
```

---

Main Dashboard

```
Today's Booking

↓

AI Recommendation

↓

Queue Status

↓

Recent Haircuts

↓

Favorite Hairstyle
```

---

# 18. AI Consultant Page

Layout

```
Photo Upload

↓

Face Analysis

↓

Recommendation

↓

Preview

↓

Chat

↓

Booking
```

---

Face Analysis Card

```
Face Shape

Confidence

Hair Density

Hair Texture

Hairline

Forehead

Jawline
```

---

Recommendation Card

```
Image

Name

Match Score

Maintenance

Styling Time

Difficulty

Preview Button
```

---

# 19. Booking Page

Gunakan Stepper.

```
1

Branch

↓

2

Barber

↓

3

Service

↓

4

Date

↓

5

Time

↓

6

Confirmation
```

---

Booking Summary

```
Branch

Barber

Service

Queue Number

Estimated Arrival

Estimated Finish
```

---

# 20. Queue Page

Layout seperti aplikasi penerbangan.

```
Queue Number

Current Queue

Estimated Arrival

Estimated Waiting Time

Status
```

Status

- Waiting
- Checked In
- Called
- On Service
- Completed

---

# 21. Barber Profile

```
Photo

Name

Experience

Rating

Specialization

Portfolio

Book Button
```

---

# 22. AI Chat

Layout seperti ChatGPT.

```
Conversation

↓

Suggestion Chips

↓

Input Box
```

Suggestion

```
Professional Hairstyle

Low Maintenance

Fade Recommendation

Hair Care

Face Shape
```

---

# 23. CMS Layout

Layout

```
Sidebar

↓

Top Navigation

↓

Page Content
```

Sidebar

```
Dashboard

Customers

Bookings

Queues

Barbers

Services

Hairstyles

AI

Content

Reports

Settings
```

---

# 24. Table Design

Minimal.

Columns

```
Customer

Booking

Status

Barber

Arrival

Actions
```

Status Color

| Status | Color |
|----------|---------|
| Waiting | Gray |
| Checked In | Blue |
| On Service | Orange |
| Completed | Green |
| Cancelled | Red |
| No Show | Amber |

---

# 25. Forms

Gunakan label di atas input.

Contoh

```
Customer Name

[____________]
```

Bukan floating label.

---

# 26. Buttons

Primary

Black

Secondary

White

Danger

Red

Ghost

Transparent

---

# 27. Cards

Gunakan:

- Border tipis
- Padding besar
- Banyak whitespace

Hindari card bertumpuk.

---

# 28. Analytics Dashboard

Widgets

```
Revenue

Bookings

Customers

Barbers

Queue

No Show
```

Charts

- Revenue
- Booking Trend
- Busy Hours
- Popular Hairstyle
- Repeat Customer
- Barber Performance

---

# 29. Responsive Breakpoints

| Device | Width |
|------------|-----------|
| Mobile | <640px |
| Tablet | 640px–1024px |
| Laptop | 1024px–1280px |
| Desktop | >1280px |

---

# 30. Accessibility

Minimum contrast ratio AA.

Semua button memiliki:

- Hover
- Focus
- Active
- Disabled

Keyboard navigation wajib didukung.

---

# 31. Design Tokens

```json
{
  "radius": {
    "sm": 12,
    "md": 16,
    "lg": 20,
    "xl": 24
  },
  "spacing": [4,8,12,16,24,32,40,48,64,80,96],
  "shadow": "0 8px 30px rgba(0,0,0,.06)",
  "border": "#E5E7EB",
  "background": "#FAFAFA",
  "surface": "#FFFFFF",
  "primary": "#111111"
}
```

---

# 32. Overall Design Identity

Produk ini harus terasa seperti perpaduan antara:

- Apple Human Interface
- Linear
- Raycast
- Stripe Dashboard
- Vercel Dashboard
- Framer
- Notion

Dengan identitas visual khas **premium barbershop**, bukan identitas khas **produk AI**.

Tujuan akhirnya adalah membuat pengguna percaya bahwa mereka sedang menggunakan layanan grooming profesional yang didukung AI, bukan aplikasi yang menjadikan AI sebagai pusat perhatian visual.