"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, Clock, Loader2 } from "lucide-react"
import { useCustomerBookingsHistory } from "@/hooks/use-customer"

const historyDataFallback = [
  {
    id: "1",
    name: "Textured Crop",
    date: "15 Jul 2026",
    barber: "Mas Dika",
    branch: "Cabang Kemang",
    rating: 5,
    duration: "35 menit",
  },
  {
    id: "2",
    name: "Buzz Cut Fade",
    date: "28 Jun 2026",
    barber: "Mas Ari",
    branch: "Cabang Senopati",
    rating: 4,
    duration: "25 menit",
  },
]

export default function HistoryPage() {
  const { data: apiBookings, isLoading } = useCustomerBookingsHistory()
  const [filter, setFilter] = useState("semua")

  const historyList = apiBookings && apiBookings.length > 0
    ? apiBookings.map((b) => ({
        id: b.id,
        name: b.service?.name || "Layanan Haircut",
        date: b.booking_date,
        barber: b.barber?.user?.name || "Barber",
        branch: b.branch?.name || "Cabang Utama",
        rating: 5,
        duration: `${b.service?.estimated_duration_minutes || 30} menit`,
      }))
    : historyDataFallback

  const filtered =
    filter === "semua"
      ? historyList
      : filter === "1bulan"
        ? historyList.slice(0, 1)
        : filter === "3bulan"
          ? historyList.slice(0, 3)
          : historyList

  return (
    <div className="space-y-6">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="1bulan">Bulan Ini</TabsTrigger>
          <TabsTrigger value="3bulan">3 Bulan</TabsTrigger>
          <TabsTrigger value="6bulan">6 Bulan</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Belum ada riwayat</p>
            <p className="text-sm text-muted-foreground">
              Riwayat potong rambut kamu akan muncul di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4 sm:p-5">
                <div className="hidden h-24 w-24 shrink-0 rounded-[14px] bg-muted sm:block" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < item.rating
                                ? "fill-warning text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Badge variant="outline">{item.duration}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.branch}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {item.barber.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{item.barber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
