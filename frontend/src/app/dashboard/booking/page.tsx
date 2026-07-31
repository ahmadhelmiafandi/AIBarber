"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Check,
  ExternalLink,
  User,
  CalendarDays,
  Timer,
  BadgeCheck,
  PartyPopper,
} from "lucide-react"

const stepLabels = [
  "Pilih Cabang",
  "Pilih Barber",
  "Pilih Layanan",
  "Pilih Tanggal",
  "Pilih Jam",
  "Konfirmasi",
]

const branches = [
  {
    id: "b1",
    name: "AI Barbershop - Sudirman",
    address: "Jl. Jend. Sudirman No. 123, Jakarta Selatan",
    phone: "021-5551234",
    hours: "09:00 - 21:00",
  },
  {
    id: "b2",
    name: "AI Barbershop - Kemang",
    address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
    phone: "021-5555678",
    hours: "10:00 - 22:00",
  },
  {
    id: "b3",
    name: "AI Barbershop - PIK",
    address: "Jl. Pantai Indah Kapuk Blok A No. 8, Jakarta Utara",
    phone: "021-5559012",
    hours: "09:00 - 20:00",
  },
]

const barbers = [
  {
    id: "br1",
    name: "Reza Mahendra",
    specialization: "Fade & Modern Cuts",
    rating: 4.9,
    experience: "8 tahun",
  },
  {
    id: "br2",
    name: "Andi Pratama",
    specialization: "Classic & Pompadour",
    rating: 4.8,
    experience: "6 tahun",
  },
  {
    id: "br3",
    name: "Budi Santoso",
    specialization: "Coloring & Perm",
    rating: 4.7,
    experience: "10 tahun",
  },
  {
    id: "br4",
    name: "Dika Ramadhan",
    specialization: "Textured & Creative",
    rating: 4.6,
    experience: "4 tahun",
  },
]

const services = [
  {
    id: "s1",
    name: "Haircut",
    price: 75000,
    duration: "30 menit",
    desc: "Potong rambut premium dengan konsultasi gaya",
  },
  {
    id: "s2",
    name: "Hair Wash",
    price: 35000,
    duration: "15 menit",
    desc: "Cuci rambut dengan shampoo dan conditioner premium",
  },
  {
    id: "s3",
    name: "Coloring",
    price: 250000,
    duration: "120 menit",
    desc: "Pewarnaan rambut dengan produk berkualitas tinggi",
  },
  {
    id: "s4",
    name: "Hair Spa",
    price: 150000,
    duration: "45 menit",
    desc: "Treatment rambut intensif untuk rambut sehat dan berkilau",
  },
  {
    id: "s5",
    name: "Perm",
    price: 350000,
    duration: "180 menit",
    desc: "Pengeritingan rambut permanen dengan teknik modern",
  },
]

function generateDates() {
  const dates: Date[] = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

const timeSlots = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9
  const min = i % 2 === 0 ? "00" : "30"
  return `${hour.toString().padStart(2, "0")}:${min}`
})

const bookedSlots = ["10:00", "10:30", "13:00", "15:30", "17:00"]

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {stepLabels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden md:inline",
                i <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < stepLabels.length - 1 && (
            <div
              className={cn(
                "w-8 h-px mx-2",
                i < currentStep ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function BookingPage() {
  const [step, setStep] = useState(0)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedBarber, setSelectedBarber] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const dates = generateDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const branch = branches.find((b) => b.id === selectedBranch)
  const barber = barbers.find((b) => b.id === selectedBarber)
  const service = services.find((s) => s.id === selectedService)

  function canNext() {
    if (step === 0) return !!selectedBranch
    if (step === 1) return !!selectedBarber
    if (step === 2) return !!selectedService
    if (step === 3) return !!selectedDate
    if (step === 4) return !!selectedTime
    return false
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Booking Berhasil!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Booking Anda telah dikonfirmasi
          </p>
          <Card className="mt-8">
            <CardContent className="p-8">
              <div className="text-6xl font-bold text-primary tracking-wider">
                A-015
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Nomor Antrian Anda</p>
              <Separator className="my-6" />
              <div className="space-y-3 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cabang</span>
                  <span className="font-medium text-foreground">{branch?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barber</span>
                  <span className="font-medium text-foreground">{barber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layanan</span>
                  <span className="font-medium text-foreground">{service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium text-foreground">
                    {selectedDate?.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jam</span>
                  <span className="font-medium text-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi Harga</span>
                  <span className="font-medium text-foreground">
                    Rp {service?.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard/queue">
              <Button variant="outline">Lacak Antrian</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Stepper currentStep={step} />

        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pilih Cabang</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pilih lokasi barbershop terdekat
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b) => (
                <Card
                  key={b.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedBranch === b.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedBranch(b.id)}
                >
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-base font-semibold text-foreground">{b.name}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        {b.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0" />
                        {b.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        {b.hours}
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <ExternalLink className="w-3 h-3" />
                      Lihat di Google Maps
                    </button>
                    {selectedBranch === b.id && (
                      <Badge>Dipilih</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pilih Barber</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pilih barber favorit Anda
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {barbers.map((b) => (
                <Card
                  key={b.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedBarber === b.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedBarber(b.id)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
                    <p className="text-xs text-muted-foreground">{b.specialization}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">
                        {b.rating}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pengalaman: {b.experience}
                    </p>
                    {selectedBarber === b.id && (
                      <Badge>Dipilih</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pilih Layanan</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pilih layanan yang Anda inginkan
            </p>
            <div className="space-y-3 max-w-2xl">
              {services.map((s) => (
                <Card
                  key={s.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedService === s.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedService(s.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedService === s.id
                          ? "border-primary"
                          : "border-border"
                      )}
                    >
                      {selectedService === s.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                          {s.name}
                        </h3>
                        <span className="text-sm font-semibold text-foreground">
                          Rp {s.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Timer className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {s.duration}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pilih Tanggal</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pilih tanggal kunjungan Anda
            </p>
            <div className="grid grid-cols-7 gap-3 max-w-2xl">
              {dates.map((d, i) => {
                const isPast = d < today
                const isSelected =
                  selectedDate?.toDateString() === d.toDateString()
                const dayName = d.toLocaleDateString("id-ID", { weekday: "short" })
                const dateNum = d.getDate()
                const month = d.toLocaleDateString("id-ID", { month: "short" })

                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-[14px] border text-center transition-colors duration-200",
                      isPast
                        ? "opacity-40 cursor-not-allowed border-border"
                        : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 cursor-pointer"
                    )}
                  >
                    <span className="text-xs font-medium">{dayName}</span>
                    <span className="text-lg font-bold">{dateNum}</span>
                    <span className="text-xs">{month}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pilih Jam</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pilih waktu yang tersedia
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-w-3xl">
              {timeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot)
                const isSelected = selectedTime === slot

                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(slot)}
                    className={cn(
                      "py-3 rounded-[14px] border text-sm font-medium transition-colors duration-200",
                      isBooked
                        ? "opacity-40 cursor-not-allowed border-border line-through text-muted-foreground"
                        : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 cursor-pointer text-foreground"
                    )}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              Konfirmasi Booking
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Periksa detail booking Anda
            </p>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground">Nomor Antrian</p>
                  <div className="text-5xl font-bold text-primary tracking-wider mt-1">
                    A-015
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Cabang
                    </span>
                    <span className="font-medium text-foreground text-right max-w-[200px]">
                      {branch?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Barber
                    </span>
                    <span className="font-medium text-foreground">{barber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Scissors className="w-4 h-4" /> Layanan
                    </span>
                    <span className="font-medium text-foreground">{service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> Tanggal
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedDate?.toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Jam
                    </span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Timer className="w-4 h-4" /> Estimasi Kedatangan
                    </span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" /> Estimasi Selesai
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedTime && service
                        ? (() => {
                            const [h, m] = selectedTime.split(":").map(Number)
                            const durMin = parseInt(service.duration)
                            const total = h * 60 + m + durMin
                            return `${Math.floor(total / 60)
                              .toString()
                              .padStart(2, "0")}:${(total % 60)
                              .toString()
                              .padStart(2, "0")}`
                          })()
                        : "-"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">
                      Estimasi Harga
                    </span>
                    <span className="font-bold text-primary">
                      Rp {service?.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => setConfirmed(true)}
                >
                  <Check className="w-4 h-4" />
                  Konfirmasi Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step < 5 && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </Button>
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Lanjut
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        {step === 5 && !confirmed && (
          <div className="flex items-center justify-start mt-8">
            <Button variant="outline" onClick={() => setStep(4)}>
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
