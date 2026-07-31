"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Download, DollarSign, TrendingUp, Users, Star } from "lucide-react"

const revenueCards = [
  { label: "Pendapatan Bulan Ini", value: "Rp 87.500.000", icon: DollarSign, change: "+18%" },
  { label: "Pendapatan Bulan Lalu", value: "Rp 74.200.000", icon: DollarSign, change: "+12%" },
  { label: "Total Transaksi", value: "1.024", icon: TrendingUp, change: "+9%" },
  { label: "Rata-rata per Transaksi", value: "Rp 85.450", icon: DollarSign, change: "+5%" },
]

const barberRanking = [
  { rank: 1, name: "Rafi Adriansyah", customers: 156, revenue: "Rp 13.260.000", rating: 4.9 },
  { rank: 2, name: "Hendra Kurniawan", customers: 142, revenue: "Rp 12.070.000", rating: 4.8 },
  { rank: 3, name: "Gilang Pratama", customers: 138, revenue: "Rp 11.730.000", rating: 4.7 },
  { rank: 4, name: "Irfan Maulana", customers: 98, revenue: "Rp 8.330.000", rating: 4.5 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Laporan pendapatan dan performa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />Export CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {revenueCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-muted">
                  <c.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant="success" className="text-[10px]">{c.change}</Badge>
              </div>
              <p className="mt-3 text-xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performa Barber</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Barber</TableHead>
                <TableHead>Total Customer</TableHead>
                <TableHead>Pendapatan</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barberRanking.map((b) => (
                <TableRow key={b.rank}>
                  <TableCell>
                    <Badge variant={b.rank <= 3 ? "default" : "outline"}>#{b.rank}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.customers}</TableCell>
                  <TableCell>{b.revenue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {b.rating}
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
