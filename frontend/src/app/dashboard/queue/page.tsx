"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  CalendarCheck,
  Clock,
  MapPin,
  User,
  Scissors,
  CheckCircle2,
  Bell,
  LogIn,
  Loader2,
  CalendarDays,
} from "lucide-react"

const queueSteps = [
  { key: "booking", label: "Booking", icon: CalendarCheck },
  { key: "waiting", label: "Waiting", icon: Clock },
  { key: "checkin", label: "Check In", icon: LogIn },
  { key: "called", label: "Called", icon: Bell },
  { key: "onservice", label: "On Service", icon: Scissors },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
] as const

type QueueStatus = (typeof queueSteps)[number]["key"]

const statusConfig: Record<
  QueueStatus,
  { label: string; variant: "default" | "secondary" | "warning" | "success" | "destructive" }
> = {
  booking: { label: "Booking", variant: "secondary" },
  waiting: { label: "Menunggu", variant: "warning" },
  checkin: { label: "Checked In", variant: "default" },
  called: { label: "Dipanggil", variant: "destructive" },
  onservice: { label: "Sedang Dilayani", variant: "default" },
  completed: { label: "Selesai", variant: "success" },
}

const mockQueue = {
  number: "A-015",
  currentServing: "A-012",
  peopleAhead: 3,
  status: "waiting" as QueueStatus,
  estimatedArrival: "14:30",
  estimatedWait: "~25 menit",
  branch: "AI Barbershop - Sudirman",
  barber: "Reza Mahendra",
  service: "Haircut",
  date: "Rabu, 30 Juli 2026",
  time: "14:30",
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Belum Ada Antrian Aktif</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anda belum memiliki booking aktif. Buat booking terlebih dahulu.
        </p>
        <Link href="/dashboard/booking">
          <Button className="mt-8" size="lg">
            <CalendarCheck className="w-4 h-4" />
            Booking Sekarang
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function QueuePage() {
  const [hasQueue] = useState(true)
  const [queue, setQueue] = useState(mockQueue)

  if (!hasQueue) return <EmptyState />

  const currentStepIndex = queueSteps.findIndex((s) => s.key === queue.status)
  const config = statusConfig[queue.status]

  function handleCheckIn() {
    setQueue((prev) => ({ ...prev, status: "checkin" }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Lacak Antrian</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau status antrian Anda secara realtime
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-primary p-8 text-center text-primary-foreground">
            <p className="text-xs font-medium opacity-70 uppercase tracking-wider">
              Nomor Antrian Anda
            </p>
            <div className="text-7xl font-bold tracking-[0.15em] mt-2">
              {queue.number}
            </div>
            <Badge
              variant={config.variant}
              className="mt-4"
            >
              {config.label}
            </Badge>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-xs text-muted-foreground">Sedang Dilayani</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {queue.currentServing}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Antrian Depan</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {queue.peopleAhead}
                </p>
                <p className="text-xs text-muted-foreground">orang sebelum Anda</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimasi Tunggu</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {queue.estimatedWait}
                </p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Estimasi Kedatangan
                </span>
                <span className="font-medium text-foreground">
                  {queue.estimatedArrival}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Cabang
                </span>
                <span className="font-medium text-foreground">{queue.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" /> Barber
                </span>
                <span className="font-medium text-foreground">{queue.barber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> Layanan
                </span>
                <span className="font-medium text-foreground">{queue.service}</span>
              </div>
            </div>

            {queue.status === "waiting" && (
              <Button className="w-full mt-6" size="lg" onClick={handleCheckIn}>
                <LogIn className="w-4 h-4" />
                Check In
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Progress Antrian
            </h3>
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {queueSteps.map((s, i) => {
                  const isActive = i === currentStepIndex
                  const isDone = i < currentStepIndex

                  return (
                    <div key={s.key} className="flex items-center gap-4 relative">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors",
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : isActive
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <s.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDone
                            ? "text-foreground"
                            : isActive
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                        {isActive && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Saat ini)
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
