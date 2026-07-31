"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Clock,
  Scissors,
  StickyNote,
} from "lucide-react"

interface Customer {
  id: number
  name: string
  initials: string
  lastVisit: string
  favoriteStyle: string
  totalVisits: number
  faceShape: string
  hairline: string
  jawline: string
  aiRecommendations: string[]
  history: { date: string; style: string; barber: string }[]
  preferences: {
    clipper: string
    side: string
    top: string
    notes: string
  }
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Ahmad Rizky",
    initials: "AR",
    lastVisit: "15 Jul 2026",
    favoriteStyle: "Textured Crop",
    totalVisits: 12,
    faceShape: "Oval",
    hairline: "Normal",
    jawline: "Tegas",
    aiRecommendations: ["Textured Crop", "French Crop", "Modern Pompadour"],
    history: [
      { date: "15 Jul 2026", style: "Textured Crop", barber: "Mas Dika" },
      { date: "28 Jun 2026", style: "Buzz Cut Fade", barber: "Mas Ari" },
      { date: "10 Jun 2026", style: "Pompadour Classic", barber: "Mas Dika" },
      { date: "25 Mei 2026", style: "Textured Crop", barber: "Mas Dika" },
    ],
    preferences: {
      clipper: "#2",
      side: "Skin fade",
      top: "3 inch",
      notes: "Suka matte finish, tidak pakai gel. Alergi produk berbahan alkohol.",
    },
  },
  {
    id: 2,
    name: "Budi Santoso",
    initials: "BS",
    lastVisit: "20 Jul 2026",
    favoriteStyle: "Buzz Cut Fade",
    totalVisits: 8,
    faceShape: "Kotak",
    hairline: "Tinggi",
    jawline: "Lebar",
    aiRecommendations: ["Buzz Cut Fade", "Crew Cut", "Ivy League"],
    history: [
      { date: "20 Jul 2026", style: "Buzz Cut Fade", barber: "Mas Dika" },
      { date: "5 Jul 2026", style: "Crew Cut", barber: "Mas Ari" },
      { date: "18 Jun 2026", style: "Buzz Cut Fade", barber: "Mas Dika" },
    ],
    preferences: {
      clipper: "#1",
      side: "High fade",
      top: "0.5 inch",
      notes: "Minta cepat selesai, tidak perlu styling. Kulit sensitif.",
    },
  },
  {
    id: 3,
    name: "Farhan Yusuf",
    initials: "FY",
    lastVisit: "12 Jul 2026",
    favoriteStyle: "Pompadour Classic",
    totalVisits: 15,
    faceShape: "Oval",
    hairline: "Normal",
    jawline: "Tirus",
    aiRecommendations: ["Modern Pompadour", "Side Part", "Quiff"],
    history: [
      { date: "12 Jul 2026", style: "Side Part", barber: "Mas Dika" },
      { date: "25 Jun 2026", style: "Pompadour Classic", barber: "Mas Dika" },
      { date: "8 Jun 2026", style: "Quiff", barber: "Mas Ari" },
    ],
    preferences: {
      clipper: "#3",
      side: "Taper",
      top: "4 inch",
      notes: "Selalu pakai pomade. Suka volume tinggi di atas. Rambut tebal gelombang.",
    },
  },
  {
    id: 4,
    name: "Rendi Pratama",
    initials: "RP",
    lastVisit: "18 Jul 2026",
    favoriteStyle: "Undercut",
    totalVisits: 6,
    faceShape: "Hati",
    hairline: "Widow's Peak",
    jawline: "Runcing",
    aiRecommendations: ["Disconnected Undercut", "Slicked Back", "Man Bun"],
    history: [
      { date: "18 Jul 2026", style: "Undercut", barber: "Mas Dika" },
      { date: "1 Jul 2026", style: "French Crop", barber: "Mas Ari" },
    ],
    preferences: {
      clipper: "#0",
      side: "Disconnected",
      top: "5 inch, slicked back",
      notes: "Rambut lurus, mudah di-styling. Minta line up tajam di hairline.",
    },
  },
]

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pelanggan</h2>
        <p className="mt-1 text-muted-foreground">{customers.length} pelanggan terdaftar</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari pelanggan..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filtered.map((cust) => {
          const isExpanded = expanded === cust.id
          return (
            <Card key={cust.id}>
              <CardContent className="p-5">
                <button
                  className="flex w-full items-center gap-4 text-left"
                  onClick={() => setExpanded(isExpanded ? null : cust.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{cust.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{cust.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Terakhir: {cust.lastVisit} · {cust.favoriteStyle}
                    </p>
                  </div>
                  <Badge variant="secondary">{cust.totalVisits} kunjungan</Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-5 space-y-5">
                    <Separator />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4" />
                          Analisis Wajah
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bentuk Wajah</span>
                            <span className="font-medium">{cust.faceShape}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Garis Rambut</span>
                            <span className="font-medium">{cust.hairline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Garis Rahang</span>
                            <span className="font-medium">{cust.jawline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="h-4 w-4" />
                          Rekomendasi AI
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cust.aiRecommendations.map((rec) => (
                            <Badge key={rec} variant="outline">{rec}</Badge>
                          ))}
                        </div>
                        <div className="aspect-[3/2] rounded-[14px] bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Foto referensi gaya rambut</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Riwayat Potong
                      </div>
                      <div className="space-y-2">
                        {cust.history.map((h, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-24 text-muted-foreground">{h.date}</span>
                            <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{h.style}</span>
                            <span className="text-muted-foreground">· {h.barber}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <StickyNote className="h-4 w-4" />
                        Preferensi
                      </div>
                      <div className="rounded-[14px] bg-muted p-4 space-y-2 text-sm">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Clipper</p>
                            <p className="font-medium">{cust.preferences.clipper}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Samping</p>
                            <p className="font-medium">{cust.preferences.side}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Atas</p>
                            <p className="font-medium">{cust.preferences.top}</p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-xs text-muted-foreground">Catatan Khusus</p>
                          <p className="mt-1">{cust.preferences.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
