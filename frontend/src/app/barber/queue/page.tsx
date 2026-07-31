"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  PhoneForwarded,
  CheckCircle2,
  Scissors,
  Clock,
  Users,
} from "lucide-react"

type QueueStatus = "dilayani" | "menunggu" | "selesai"

interface QueueItem {
  id: number
  position: number
  customer: string
  initials: string
  service: string
  duration: string
  checkInTime: string
  status: QueueStatus
}

const initialQueue: QueueItem[] = [
  {
    id: 1,
    position: 1,
    customer: "Farhan Yusuf",
    initials: "FY",
    service: "Pompadour Classic",
    duration: "60 menit",
    checkInTime: "10:15",
    status: "dilayani",
  },
  {
    id: 2,
    position: 2,
    customer: "Rendi Pratama",
    initials: "RP",
    service: "Undercut",
    duration: "45 menit",
    checkInTime: "10:30",
    status: "menunggu",
  },
  {
    id: 3,
    position: 3,
    customer: "Galih Saputra",
    initials: "GS",
    service: "French Crop",
    duration: "45 menit",
    checkInTime: "10:45",
    status: "menunggu",
  },
  {
    id: 4,
    position: 4,
    customer: "Hendra Wijaya",
    initials: "HW",
    service: "Crew Cut",
    duration: "30 menit",
    checkInTime: "11:00",
    status: "menunggu",
  },
]


export default function QueuePage() {
  const [queue, setQueue] = useState(initialQueue)

  const current = queue.find((q) => q.status === "dilayani")
  const waiting = queue.filter((q) => q.status === "menunggu")
  const completed = queue.filter((q) => q.status === "selesai")

  function finishCurrent() {
    setQueue((prev) => {
      const updated = prev.map((q) => {
        if (q.status === "dilayani") return { ...q, status: "selesai" as const }
        return q
      })
      const firstWaiting = updated.find((q) => q.status === "menunggu")
      if (firstWaiting) {
        return updated.map((q) =>
          q.id === firstWaiting.id ? { ...q, status: "dilayani" as const } : q
        )
      }
      return updated
    })
  }

  function callNext() {
    const firstWaiting = queue.find((q) => q.status === "menunggu")
    if (!firstWaiting || current) return
    setQueue((prev) =>
      prev.map((q) =>
        q.id === firstWaiting.id ? { ...q, status: "dilayani" as const } : q
      )
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Antrian</h2>
        <p className="mt-1 text-muted-foreground">
          {waiting.length} menunggu · {completed.length} selesai
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {current && (
            <Card className="border-warning/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-warning" />
                  <CardTitle className="text-base">Sedang Dilayani</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{current.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{current.customer}</p>
                    <p className="text-sm text-muted-foreground">{current.service} · {current.duration}</p>
                  </div>
                  <Badge variant="warning">Dilayani</Badge>
                </div>
                <Button onClick={finishCurrent} className="w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Selesai
                </Button>
              </CardContent>
            </Card>
          )}

          {!current && waiting.length > 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">Tidak ada yang sedang dilayani</p>
                <Button onClick={callNext}>
                  <PhoneForwarded className="mr-2 h-4 w-4" />
                  Panggil Selanjutnya
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Daftar Tunggu</h3>
            {waiting.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Tidak ada antrian menunggu
                </CardContent>
              </Card>
            ) : (
              waiting.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-muted text-sm font-bold">
                      {item.position}
                    </div>
                    <Avatar>
                      <AvatarFallback>{item.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.customer}</p>
                      <p className="text-xs text-muted-foreground">{item.service} · {item.duration}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {item.checkInTime}
                    </div>
                    <Badge variant="secondary">Menunggu</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan Antrian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Hari Ini</span>
                <span className="font-medium">{queue.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sedang Dilayani</span>
                <span className="font-medium">{current ? 1 : 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Menunggu</span>
                <span className="font-medium">{waiting.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selesai</span>
                <span className="font-medium">{completed.length}</span>
              </div>
            </CardContent>
          </Card>

          {waiting.length > 0 && current && (
            <Button onClick={finishCurrent} variant="outline" className="w-full">
              <PhoneForwarded className="mr-2 h-4 w-4" />
              Panggil Selanjutnya
            </Button>
          )}

          {completed.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selesai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completed.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.customer}</p>
                      <p className="text-xs text-muted-foreground">{item.service}</p>
                    </div>
                    <Badge variant="success">Selesai</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
