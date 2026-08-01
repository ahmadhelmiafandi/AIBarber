"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Pencil, XCircle, RefreshCw, UserCog } from "lucide-react"

type BookingStatus = "Menunggu" | "Check In" | "On Service" | "Selesai" | "Dibatalkan" | "No Show"

const statusVariant: Record<BookingStatus, "secondary" | "default" | "warning" | "success" | "destructive" | "outline"> = {
  "Menunggu": "secondary",
  "Check In": "default",
  "On Service": "warning",
  "Selesai": "success",
  "Dibatalkan": "destructive",
  "No Show": "outline",
}

const initialBookings = [
  { id: 1, customer: "Ahmad Rizky", barber: "Rafi Adriansyah", service: "Haircut", date: "2026-07-29", time: "09:00", queue: "A-001", status: "Selesai" as BookingStatus },
  { id: 2, customer: "Budi Santoso", barber: "Gilang Pratama", service: "Hair Wash + Haircut", date: "2026-07-29", time: "09:30", queue: "A-002", status: "On Service" as BookingStatus },
  { id: 3, customer: "Chandra Wijaya", barber: "Hendra Kurniawan", service: "Beard Trim", date: "2026-07-29", time: "10:00", queue: "A-003", status: "Check In" as BookingStatus },
  { id: 4, customer: "Dimas Pratama", barber: "Rafi Adriansyah", service: "Hair Coloring", date: "2026-07-29", time: "10:30", queue: "A-004", status: "Menunggu" as BookingStatus },
  { id: 5, customer: "Eko Saputra", barber: "Gilang Pratama", service: "Haircut", date: "2026-07-29", time: "11:00", queue: "A-005", status: "Menunggu" as BookingStatus },
  { id: 6, customer: "Fajar Nugroho", barber: "Hendra Kurniawan", service: "Hair Treatment", date: "2026-07-29", time: "11:30", queue: "A-006", status: "Dibatalkan" as BookingStatus },
  { id: 7, customer: "Gunawan", barber: "Rafi Adriansyah", service: "Haircut", date: "2026-07-28", time: "14:00", queue: "A-018", status: "No Show" as BookingStatus },
  { id: 8, customer: "Haris Munandar", barber: "Irfan Maulana", service: "Beard Trim", date: "2026-07-28", time: "15:00", queue: "A-019", status: "Selesai" as BookingStatus },
]

const allStatuses: BookingStatus[] = ["Menunggu", "Check In", "On Service", "Selesai", "Dibatalkan", "No Show"]

export default function BookingsPage() {
  const [bookings] = useState(initialBookings)
  const [tab, setTab] = useState("Semua")

  const filtered = tab === "Semua" ? bookings : bookings.filter((b) => b.status === tab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">Kelola reservasi pelanggan</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="Semua">Semua</TabsTrigger>
          {allStatuses.map((s) => (
            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Barber</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>No. Antrian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.customer}</TableCell>
                  <TableCell>{b.barber}</TableCell>
                  <TableCell>{b.service}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.time}</TableCell>
                  <TableCell className="font-mono">{b.queue}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Batalkan"><XCircle className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Reschedule"><RefreshCw className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ganti Barber"><UserCog className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
