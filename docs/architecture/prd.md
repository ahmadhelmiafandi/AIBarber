# Product Requirements Document (PRD)
# AI Smart Barbershop Management System

**Version:** 1.0.0  
**Status:** Draft  
**Document Owner:** Product Team  
**Last Updated:** July 2026

---

# 1. Executive Summary

AI Smart Barbershop Management System adalah platform web modern yang mengintegrasikan Artificial Intelligence, Smart Queue Management, Online Booking, Customer Management, dan Content Management System (CMS) dalam satu ekosistem.

Sistem ini dirancang untuk mengatasi berbagai masalah yang sering dialami pelanggan dan pemilik barbershop, seperti:

- Pelanggan tidak mengetahui gaya rambut yang cocok.
- Sulit menjelaskan potongan rambut kepada barber.
- AI umum menghasilkan rekomendasi yang kurang akurat.
- AI image generation sering mengubah struktur wajah pengguna.
- Antrean panjang.
- Booking masih manual.
- Owner kesulitan memonitor operasional.
- Barber tidak mengetahui preferensi pelanggan sebelum pelanggan datang.

Platform ini bertujuan menjadi **AI Personal Hair Consultant** sekaligus **Smart Barbershop Management System**.

---

# 2. Vision

Membangun platform barbershop berbasis AI yang mampu memberikan pengalaman digital dari konsultasi rambut hingga proses haircut selesai dengan efisien, akurat, dan modern.

---

# 3. Objectives

## Business Objectives

- Meningkatkan booking online.
- Mengurangi waktu tunggu pelanggan.
- Mengurangi tingkat no-show.
- Meningkatkan repeat customer.
- Membantu owner mengambil keputusan berbasis data.

---

## Customer Objectives

- Mengetahui hairstyle terbaik.
- Melihat simulasi rambut.
- Booking tanpa antre lama.
- Mendapat estimasi waktu datang.
- Menyimpan histori haircut.

---

## Barber Objectives

- Mengetahui preferensi pelanggan.
- Mengurangi miskomunikasi.
- Mempercepat proses konsultasi.

---

## Owner Objectives

- Monitoring operasional.
- Monitoring pendapatan.
- Monitoring performa barber.
- Mengelola seluruh data dari CMS.

---

# 4. User Roles

## Customer

Permissions:

- Register
- Login
- AI Hair Consultant
- AI Chat
- Hair Preview
- Booking
- Queue Tracking
- Review
- Hair History
- Membership
- Favorite Hairstyle

---

## Barber

Permissions:

- Dashboard
- Today's Schedule
- Customer Detail
- AI Recommendation
- Customer Reference
- Update Queue
- Complete Service
- Upload Portfolio

---

## Receptionist

Permissions:

- Queue Management
- Manual Booking
- Walk-in Customer
- Check In
- Reschedule
- Cancel Booking

---

## Admin

Permissions:

- Full CMS
- AI Prompt Management
- Hairstyle Management
- Queue Management
- Booking Management
- Customer Management
- Barber Management
- Content Management

---

## Owner

Permissions:

- Dashboard
- Analytics
- Revenue Report
- Performance Report
- All CMS Access

---

# 5. Product Modules

## Customer Website

- Landing Page
- AI Hair Consultant
- AI Chat
- Hairstyle Recommendation
- Virtual Hairstyle Preview
- Booking
- Queue Tracking
- Customer Dashboard
- Hair History
- Favorite Hairstyle
- Membership
- Review

---

## CMS

- Dashboard
- Customer
- Barber
- Branch
- Booking
- Queue
- Hairstyle
- Services
- AI Prompt
- AI Rules
- Testimonials
- Portfolio
- Blog
- Promotion
- Membership
- Analytics
- Reports

---

# 6. Master User Flow

```text
Landing Page

↓

Register/Login

↓

Customer Dashboard

↓

AI Hair Consultation

↓

Face Analysis

↓

AI Recommendation

↓

Virtual Hairstyle Preview

↓

Save Favorite Hairstyle

↓

Booking

↓

Queue Number

↓

Realtime Queue

↓

Check In

↓

Haircut

↓

Review

↓

Hair History
```

---

# 7. Smart Booking Flow

```text
Select Branch

↓

Select Barber

↓

Select Service

↓

Select Date

↓

Select Time

↓

Queue Engine

↓

Calculate Estimated Start

↓

Generate Queue Number

↓

Booking Confirmation

↓

Reminder Notification

↓

Customer Arrives

↓

Check In

↓

Waiting

↓

Haircut

↓

Completed
```

---

# 8. Smart Queue Flow

```text
Booking Created

↓

Service Duration

↓

Current Queue

↓

Queue Calculation

↓

Estimated Arrival

↓

Estimated Start

↓

Estimated Finish

↓

Realtime Queue Update

↓

Customer Called

↓

Service

↓

Completed
```

---

# 9. Late Policy

```text
Booking Active

↓

Customer Arrival

↓

Within Tolerance

↓

Check In

↓

Waiting

↓

Haircut

↓

Completed
```

OR

```text
Booking Active

↓

Late

↓

Tolerance Exceeded

↓

Booking Expired

↓

Queue Updated

↓

Waiting List Promoted
```

---

# 10. AI System Flow

```text
Upload Selfie

↓

Image Validation

↓

Face Detection

↓

Hair Detection

↓

Hairline Detection

↓

Forehead Detection

↓

Jawline Detection

↓

Face Shape Detection

↓

Hair Density Detection

↓

Hair Texture Detection

↓

Face Analysis Result

↓

Recommendation Engine

↓

LLM Consultation

↓

Hair Preview

↓

Save Result
```

---

# 11. AI Architecture

```text
Customer

↓

Photo Upload

↓

Computer Vision

↓

Face Analysis

↓

Recommendation Engine

↓

Prompt Builder

↓

LLM

↓

Image Editing AI

↓

Final Result
```

---

# 12. Functional Requirements

## Authentication

Features

- Register
- Login
- Google Login
- Forgot Password
- Email Verification
- Role Based Access Control

---

## AI Hair Consultant

Input

- Selfie

Output

- Face Shape
- Hairline
- Hair Density
- Hair Texture
- Forehead Type
- Jawline
- Confidence Score

---

## Recommendation Engine

Output

- Top Hairstyle
- Match Score
- Reason
- Maintenance Level
- Difficulty
- Styling Time

---

## AI Chat

Features

- Natural Conversation
- Personalized Advice
- Hairstyle Discussion
- Haircare Advice
- Lifestyle Recommendation

---

## Virtual Hairstyle

Requirements

- Preserve Face Identity
- Hair Only Editing
- Photorealistic
- High Resolution

---

## Booking

Features

- Online Booking
- Queue Number
- Estimated Arrival
- Estimated Finish
- Reschedule
- Cancel Booking

---

## Queue

Statuses

- Waiting
- Checked In
- Called
- On Service
- Completed
- Cancelled
- No Show
- Expired

---

## Notifications

Events

- Booking Success
- Queue Updated
- Reminder
- Called
- Completed
- Promotion
- Membership

---

# 13. CMS Requirements

## Dashboard

Widgets

- Revenue Today
- Today's Queue
- Today's Booking
- Active Barber
- New Customer
- Repeat Customer
- No Show
- Queue Waiting Time

---

## Customer Management

CRUD

Fields

- Name
- Phone
- Email
- Membership
- Status

---

## Barber Management

CRUD

Fields

- Name
- Experience
- Specialization
- Schedule
- Portfolio
- Status

---

## Branch Management

CRUD

Fields

- Name
- Address
- Phone
- Google Maps
- Opening Hours

---

## Service Management

CRUD

Fields

- Name
- Price
- Estimated Duration
- Description
- Active Status

Estimated Duration digunakan Queue Engine.

---

## Hairstyle Management

CRUD

Fields

- Name
- Category
- Hair Length
- Maintenance
- Difficulty
- Face Shape
- Hair Texture
- Gallery
- Description

---

## AI Prompt Management

Admin dapat mengubah:

- System Prompt
- Chat Prompt
- Recommendation Prompt
- Image Prompt

Tanpa deploy ulang.

---

## AI Rules Management

Admin dapat mengubah rule recommendation.

Contoh

```
Round Face

↓

French Crop

Score +30
```

---

## Queue Management

Features

- Call Queue
- Skip Queue
- Manual Queue
- Priority Queue
- Cancel Queue
- Transfer Queue

---

## Booking Management

Features

- Manual Booking
- Reschedule
- Cancel
- Change Barber
- Change Service

---

## Testimonials

CRUD

Fields

- Customer
- Rating
- Content
- Image
- Published

---

## Portfolio

CRUD

Fields

- Before
- After
- Barber
- Hairstyle
- Description

---

## Blog

CRUD

Fields

- Title
- Slug
- Thumbnail
- Content
- SEO

---

## Promotion

CRUD

Fields

- Banner
- Voucher
- Discount
- Expired Date

---

## Membership

CRUD

Fields

- Name
- Benefits
- Discount
- Price

---

# 14. Queue Calculation

Estimated Queue menggunakan formula:

Estimated Start Time =
Current Time
+ Remaining Service Duration
+ Previous Queue Duration

Admin dapat mengubah estimasi setiap layanan.

Contoh

| Service | Duration |
|----------|----------|
| Haircut | 30 Minutes |
| Hair Wash | 15 Minutes |
| Coloring | 120 Minutes |
| Hair Spa | 45 Minutes |
| Perm | 180 Minutes |

Queue Engine selalu menggunakan data terbaru.

---

# 15. AI Prompt

## System Prompt

```text
You are a professional AI Hair Consultant.

Analyze only detected facial features.

Never guess missing information.

Recommend hairstyles only from the hairstyle database.

Always explain your recommendation.

Never recommend incompatible hairstyles.

Rank recommendations objectively.
```

---

## Chat Prompt

```text
Customer Profile

Face Shape

Hairline

Hair Density

Hair Texture

Lifestyle

Favorite Hairstyle

Question

Answer professionally.
```

---

## Image Editing Prompt

```text
Edit only the hairstyle.

Keep facial identity exactly the same.

Do not modify:

Face

Eyes

Nose

Mouth

Skin

Jaw

Expression

Lighting

Only edit hair.

Generate photorealistic output.
```

---

# 16. Non Functional Requirements

## Performance

- Normal Response < 2 Seconds
- AI Analysis < 10 Seconds
- Queue Update Real-time

---

## Security

- HTTPS
- JWT Authentication
- Password Hashing
- RBAC
- Audit Log

---

## Scalability

Support

- Multi Branch
- Thousands of Customers
- Concurrent Queue

---

## Availability

99.9%

---

## Responsive

- Desktop
- Tablet
- Mobile

---

# 17. Recommended Technology Stack

Frontend

- Next.js
- TypeScript
- TailwindCSS
- TanStack Query

Backend

- Laravel 12

Database

- PostgreSQL

Realtime

- Laravel Reverb

Cache

- Redis

Storage

- Supabase Storage
- Cloudflare R2

Authentication

- Laravel Sanctum

AI

- Computer Vision
- Recommendation Engine
- OpenAI / Gemini
- Image Editing AI

Deployment

- Docker
- Nginx
- Ubuntu Server

---

# 18. Success Metrics

## AI

- Face Detection Accuracy ≥ 95%
- Hairstyle Recommendation Satisfaction ≥ 4.5 / 5
- Face Identity Preservation ≥ 95%

---

## Booking

- Queue Waiting Reduced ≥ 50%
- Online Booking ≥ 70%
- No Show < 10%

---

## Business

- Repeat Customer ≥ 25%
- Customer Satisfaction ≥ 4.5
- Booking Conversion ≥ 60%

---

# 19. Future Roadmap

## Phase 1

- AI Hair Consultant
- Booking
- Queue
- CMS
- Dashboard

---

## Phase 2

- Membership
- Loyalty Points
- Voucher
- Multi Branch
- WhatsApp Notification
- QR Check In

---

## Phase 3

- AI Hair Health
- AI Product Recommendation
- AI Trend Analytics
- Predictive Queue
- Business Intelligence Dashboard
- AI Staffing Recommendation

---

# 20. Future Enhancements

- AI Hair Growth Simulation
- AI Aging Hairstyle Preview
- AR Hairstyle Preview
- Voice AI Hair Consultant
- Smart Mirror Integration
- POS Integration
- Inventory Management
- Payroll Management
- Customer Loyalty AI
- Predictive Revenue Analytics
- AI Marketing Automation
- Franchise Management
- Mobile Application (Android & iOS)
- Public API