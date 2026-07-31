"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, Clock } from "lucide-react"

const historyData = [
  {
    id: 1,
    name: "Textured Crop",
    date: "15 Jul 2026",
    barber: "Mas Dika",
    branch: "Cabang Kemang",
    rating: 5,
    duration: "35 menit",
  },
  {
    id: 2,
    name: "Buzz Cut Fade",
    date: "28 Jun 2026",
    barber: "Mas Ari",
    branch: "Cabang Senopati",
    rating: 4,
    duration: "25 menit",
  },
  {
    id: 3,
    name: "Pompadour Classic",
    date: "10 Jun 2026",
    barber: "Mas Dika",
    branch: "Cabang Kemang",
    rating: 5,
    duration: "40 menit",
  },
  {
    id: 4,
    name: "Side Part",
    date: "22 Mei 2026",
    barber: "Mas Rizal",
    branch: "Cabang Sudirman",
    rating: 4,
    duration: "30 menit",
  },
  {
    id: 5,
    name: "Undercut",
    date: "5 Mei 2026",
    barber: "Mas Dika",
    branch: "Cabang Kemang",
    rating: 5,
    duration: "35 menit",
  },
  {
    id: 6,
    name: "French Crop",
    date: "18 Apr 2026",
    barber: "Mas Ari",
    branch: "Cabang Senopati",
    rating: 4,
    duration: "30 menit",
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState("semua")

  const filtered =
    filter === "semua"
      ? historyData
      : filter === "1bulan"
        ? historyData.slice(0, 2)
        : filter === "3bulan"
          ? historyData.slice(0, 4)
          : historyData

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

      {filtered.length === 0 ? (
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
                        {item.barber.split(" ")[1]?.[0] || item.barber[0]}
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
