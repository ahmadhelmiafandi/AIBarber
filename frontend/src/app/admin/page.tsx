"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  DollarSign,
  ListOrdered,
  CalendarCheck,
  Scissors,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const stats = [
  { label: "Pendapatan Hari Ini", value: "Rp 3.450.000", icon: DollarSign, trend: "+12%", up: true },
  { label: "Antrian Hari Ini", value: "24", icon: ListOrdered, trend: "+8%", up: true },
  { label: "Booking Hari Ini", value: "18", icon: CalendarCheck, trend: "+5%", up: true },
  { label: "Barber Aktif", value: "6", icon: Scissors, trend: "0%", up: true },
  { label: "Customer Baru", value: "7", icon: UserPlus, trend: "+15%", up: true },
  { label: "Repeat Customer", value: "11", icon: UserCheck, trend: "+3%", up: true },
  { label: "No Show", value: "2", icon: UserX, trend: "-25%", up: false },
  { label: "Rata-rata Tunggu", value: "12 min", icon: Clock, trend: "-8%", up: false },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan operasional hari ini</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
