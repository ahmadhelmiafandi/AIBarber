"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import { useAdminBookings } from "@/hooks/use-admin"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Pencil, XCircle, RefreshCw, UserCog, Loader2 } from "lucide-react"

type BookingStatus = "Semua" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show"

const statusLabels: Record<string, string> = {
  "pending": "Menunggu",
  "confirmed": "Check In",
  "completed": "Selesai",
  "cancelled": "Dibatalkan",
  "no_show": "No Show",
}

const statusVariant: Record<string, "secondary" | "default" | "warning" | "success" | "destructive" | "outline"> = {
  "pending": "secondary",
  "confirmed": "default",
  "completed": "success",
  "cancelled": "destructive",
  "no_show": "outline",
}

export default function BookingsPage() {
  const [tab, setTab] = useState<BookingStatus>("Semua")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useAdminBookings({
    page,
    perPage: pageSize,
    search,
    status: tab === "Semua" ? "" : tab,
  })

  const bookings = data?.data || []
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">Kelola dan lihat reservasi pelanggan secara real-time</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={(val) => { setTab(val as BookingStatus); setPage(1); }} className="w-full md:w-auto">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="Semua">Semua</TabsTrigger>
            <TabsTrigger value="pending">Menunggu</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
          </TabsList>
        </Tabs>

        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="Cari kode reservasi, customer, atau barber..."
          className="w-full md:w-80"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode / Customer</TableHead>
                <TableHead>Barber</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Tanggal & Jam</TableHead>
                <TableHead>No. Antrian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Memuat data booking...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Tidak ada reservasi yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{b.customer?.name || "Pelanggan"}</div>
                      <div className="text-xs font-mono text-muted-foreground">{b.booking_code}</div>
                    </TableCell>
                    <TableCell>{b.barber?.user?.name || "-"}</TableCell>
                    <TableCell>{b.service?.name || "-"}</TableCell>
                    <TableCell>
                      <div>{b.booking_date}</div>
                      <div className="text-xs text-muted-foreground">{b.booking_time}</div>
                    </TableCell>
                    <TableCell className="font-mono">{b.queue?.queue_code || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[b.status] || "outline"}>
                        {statusLabels[b.status] || b.status}
                      </Badge>
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
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="border-t px-4 py-2">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              totalItems={meta.total}
              pageSize={meta.per_page}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
