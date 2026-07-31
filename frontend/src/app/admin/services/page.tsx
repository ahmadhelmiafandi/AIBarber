"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Clock } from "lucide-react"

const initialServices = [
  { id: 1, name: "Haircut", price: 85000, duration: 30, status: "Aktif" },
  { id: 2, name: "Hair Wash", price: 35000, duration: 15, status: "Aktif" },
  { id: 3, name: "Hair Coloring", price: 250000, duration: 90, status: "Aktif" },
  { id: 4, name: "Beard Trim", price: 45000, duration: 20, status: "Aktif" },
  { id: 5, name: "Hair Treatment", price: 150000, duration: 60, status: "Nonaktif" },
]

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`

export default function ServicesPage() {
  const [services] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">Kelola layanan barbershop</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Layanan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Layanan</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Estimasi Durasi
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{formatRp(s.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {s.duration} menit
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Aktif" ? "success" : "destructive"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Layanan</DialogTitle>
            <DialogDescription>Estimasi durasi digunakan oleh Queue Engine untuk perhitungan antrian</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Layanan</Label>
              <Input placeholder="Nama layanan" />
            </div>
            <div className="grid gap-2">
              <Label>Harga (Rp)</Label>
              <Input type="number" placeholder="85000" />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Estimasi Durasi (menit)
              </Label>
              <Input type="number" placeholder="30" className="border-primary/50 text-lg font-mono" />
              <p className="text-xs text-muted-foreground">Durasi ini dipakai Queue Engine untuk estimasi waktu tunggu</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
