# Data Flow & Integration

## 1. Booking Data Flow

Proses booking merupakan aliran data yang tersinkronisasi untuk memastikan tidak ada *double booking* dan antrian terekam dengan akurat.

```mermaid
sequenceDiagram
    participant C as Customer (FE)
    participant B as Booking Service
    participant M as Master Data (Barber/Service)
    participant Q as Queue Engine
    participant DB as PostgreSQL

    C->>B: Request Available Slots (Date, Barber)
    B->>M: Get Barber Schedule
    B->>DB: Query existing active bookings
    B-->>C: Return Available Time Slots

    C->>B: Submit Booking (Barber, Service, Time)
    
    rect rgb(240, 248, 255)
        Note right of B: Transaction Start
        B->>DB: Lock slot (Pessimistic Lock)
        B->>DB: Validate availability again
        B->>DB: Insert Booking Record
        
        B->>Q: Dispatch Event (Calculate Queue)
        Q->>DB: Calculate & Insert Queue Ticket
        
        B->>DB: Commit Transaction
    end
    
    B-->>C: Return Booking Success & Queue Number
```

## 2. AI Recommendation & Preview Flow

Mengacu pada prinsip **Recommendation Before Generation** dan **Identity Preservation**.

```mermaid
sequenceDiagram
    participant C as Customer (FE)
    participant AI as AI Gateway (Laravel)
    participant CV as Ext. Computer Vision API
    participant Rec as Recommendation Engine
    participant Gen as Ext. Image Generation API
    participant S3 as Object Storage

    %% Step 1: Analysis
    C->>AI: Upload Photo
    AI->>S3: Store Temporary Photo
    AI->>CV: Request Face & Hair Analysis
    CV-->>AI: JSON (Face Shape, Hairline, etc.)
    AI->>Rec: Run Scoring against Hairstyle DB
    Rec-->>AI: Top 6 Recommendations + Explanation
    AI-->>C: Return Analysis & Recommendations

    %% Step 2: Preview
    C->>AI: Select Hairstyle ID to Preview
    AI->>Gen: Request Hair Edit (Original Photo + Target Style)
    Note right of Gen: Face Lock enforced by prompt/masking
    Gen-->>AI: Edited Image URL
    
    %% Step 3: Verification
    AI->>CV: Verify Identity (Original vs Edited)
    CV-->>AI: Similarity Score (e.g. 0.98)
    
    alt Similarity >= 0.95
        AI->>S3: Move Image to Permanent Storage
        AI-->>C: Return Preview Image
    else Similarity < 0.95
        AI-->>C: Return Error "Gagal mempertahankan identitas, coba foto lain."
    end
```

## 3. Real-time Queue Update Flow

```mermaid
sequenceDiagram
    participant Barber as Barber (FE)
    participant Q as Queue Service
    participant Redis as Redis Pub/Sub
    participant Customer as Customer (FE)

    Barber->>Q: Click "Selesai" untuk Customer A
    Q->>Q: Mark A as Completed
    Q->>Q: Recalculate Estimated Time for B, C, D
    Q->>Redis: Broadcast QueueUpdateEvent
    
    Note right of Redis: Laravel Reverb pushes via WebSocket
    Redis-->>Customer: Push new Estimated Time / Status
    Customer->>Customer: UI Updates without refresh
```

## 4. External Integrations

Sistem berinteraksi dengan dunia luar melalui port/adapter yang terenkapsulasi:

| Integration Point | Purpose | Interface/Driver (Backend) |
|---|---|---|
| **Computer Vision AI** | Face detection & segmentation | `FaceAnalysisClient` (e.g., RunPod/Replicate) |
| **Generative AI** | Hair masking & replacement | `ImageGenerationClient` (e.g., Stable Diffusion Inpainting API) |
| **LLM (OpenAI/Gemini)** | AI Chat Consultant | `AIChatClient` (e.g., OpenAI API) |
| **Object Storage** | Store uploads, portfolio, previews | `S3FilesystemDriver` (AWS S3/Cloudflare R2) |
| **Email Service** | Booking confirmation, password reset | `SmtpMailDriver` / Resend / Mailgun |
| **WhatsApp (Future)** | Queue reminders via WA | `WhatsAppNotificationChannel` |
