"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
} from "lucide-react"

type AppointmentStatus = "selesai" | "berlangsung" | "menunggu" | "tidak_hadir"

interface Appointment {
  id: number
  time: string
  duration: string
  customer: string
  initials: string
  service: string
  status: AppointmentStatus
  faceShape: string
  hairline: string
  preferredStyle: string
  aiRecommendation: string
  history: string[]
  notes: string
}

const appointments: Appointment[] = [
  {
    id: 1,
    time: "09:00",
    duration: "45 menit",
    customer: "Ahmad Rizky",
    initials: "AR",
    service: "Textured Crop",
    status: "selesai",
    faceShape: "Oval",
    hairline: "Normal",
    preferredStyle: "Textured Crop",
    aiRecommendation: "Textured Crop dengan fade samping",
    history: ["Textured Crop - 15 Jul", "Buzz Cut - 28 Jun", "Pompadour - 10 Jun"],
    notes: "Clipper #2, samping skin fade, atas 3 inch",
  },
  {
    id: 2,
    time: "09:45",
    duration: "30 menit",
    customer: "Budi Santoso",
    initials: "BS",
    service: "Buzz Cut Fade",
    status: "selesai",
    faceShape: "Kotak",
    hairline: "Tinggi",
    preferredStyle: "Buzz Cut Fade",
    aiRecommendation: "Buzz Cut dengan mid fade",
    history: ["Buzz Cut - 20 Jul", "Crew Cut - 5 Jul"],
    notes: "Clipper #1 all around, high fade",
  },
  {
    id: 3,
    time: "10:30",
    duration: "60 menit",
    customer: "Farhan Yusuf",
    initials: "FY",
    service: "Pompadour Classic",
    status: "berlangsung",
    faceShape: "Oval",
    hairline: "Normal",
    preferredStyle: "Pompadour Classic",
    aiRecommendation: "Modern Pompadour dengan taper fade",
    history: ["Side Part - 12 Jul", "Pompadour - 25 Jun"],
    notes: "Atas 4 inch, samping taper, pakai pomade matte",
  },
  {
    id: 4,
    time: "11:30",
    duration: "45 menit",
    customer: "Rendi Pratama",
    initials: "RP",
    service: "Undercut",
    status: "menunggu",
    faceShape: "Hati",
    hairline: "Widow's Peak",
    preferredStyle: "Undercut",
    aiRecommendation: "Disconnected Undercut",
    history: ["Undercut - 18 Jul", "French Crop - 1 Jul"],
    notes: "Samping #0, atas panjang slicked back",
  },
  {
    id: 5,
    time: "13:00",
    duration: "45 menit",
    customer: "Galih Saputra",
    initials: "GS",
    service: "French Crop",
    status: "menunggu",
    faceShape: "Bulat",
    hairline: "Normal",
    preferredStyle: "French Crop",
    aiRecommendation: "Textured French Crop untuk volume atas",
    history: ["French Crop - 10 Jul"],
    notes: "Fringe pendek, samping mid fade, clipper #2",
  },
  {
    id: 6,
    time: "14:00",
    duration: "30 menit",
    customer: "Hendra Wijaya",
    initials: "HW",
    service: "Crew Cut",
    status: "menunggu",
    faceShape: "Panjang",
    hairline: "Mundur",
    preferredStyle: "Crew Cut",
    aiRecommendation: "Crew Cut dengan textured top",
    history: ["Crew Cut - 22 Jul", "Buzz Cut - 8 Jul", "Crew Cut - 20 Jun"],
    notes: "Atas 2 inch, samping #1.5, blend natural",
  },
]

const statusConfig = {
  selesai: { label: "Selesai", variant: "success" as const },
  berlangsung: { label: "Berlangsung", variant: "warning" as const },
  menunggu: { label: "Menunggu", variant: "secondary" as const },
  tidak_hadir: { label: "Tidak Hadir", variant: "destructive" as const },
}

export default function SchedulePage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [statuses, setStatuses] = useState<Record<number, AppointmentStatus>>(
    Object.fromEntries(appointments.map((a) => [a.id, a.status]))
  )

  function updateStatus(id: number, status: AppointmentStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Jadwal Hari Ini</h2>
        <p className="mt-1 text-muted-foreground">Selasa, 29 Juli 2026 · 6 jadwal</p>
      </div>

      <div className="space-y-4">
        {appointments.map((apt) => {
          const status = statuses[apt.id]
          const isExpanded = expanded === apt.id
          return (
            <Card key={apt.id} className={status === "berlangsung" ? "border-warning/30" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-16 flex-col items-center justify-center rounded-[10px] bg-muted">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold">{apt.time}</span>
                  </div>

                  <Avatar>
                    <AvatarFallback>{apt.initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{apt.customer}</p>
                    <p className="text-sm text-muted-foreground">{apt.service} · {apt.duration}</p>
                  </div>

                  <Badge variant={statusConfig[status].variant}>
                    {statusConfig[status].label}
                  </Badge>

                  <button onClick={() => setExpanded(isExpanded ? null : apt.id)}>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4" />
                          Analisis Wajah
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bentuk Wajah</span>
                            <span className="font-medium">{apt.faceShape}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Garis Rambut</span>
                            <span className="font-medium">{apt.hairline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gaya Pilihan</span>
                            <span className="font-medium">{apt.preferredStyle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="h-4 w-4" />
                          Rekomendasi AI
                        </div>
                        <p className="text-sm text-muted-foreground">{apt.aiRecommendation}</p>
                        <div className="aspect-[3/2] rounded-[14px] bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Referensi gaya rambut</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Riwayat Potong</p>
                      <div className="flex flex-wrap gap-2">
                        {apt.history.map((h, i) => (
                          <Badge key={i} variant="outline">{h}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[14px] bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">Catatan Preferensi</p>
                      <p className="mt-1 text-sm">{apt.notes}</p>
                    </div>

                    {status === "menunggu" && (
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => updateStatus(apt.id, "berlangsung")}>
                          <Play className="mr-1.5 h-3.5 w-3.5" />
                          Mulai
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(apt.id, "tidak_hadir")}>
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Tidak Hadir
                        </Button>
                      </div>
                    )}
                    {status === "berlangsung" && (
                      <Button size="sm" onClick={() => updateStatus(apt.id, "selesai")}>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Selesai
                      </Button>
                    )}
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
