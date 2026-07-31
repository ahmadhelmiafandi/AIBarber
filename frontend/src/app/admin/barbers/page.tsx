"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Star } from "lucide-react"

const initialBarbers = [
  { id: 1, name: "Rafi Adriansyah", branch: "Cabang Kemang", specialization: "Fade, Pompadour", rating: 4.9, status: "Aktif", initials: "RA" },
  { id: 2, name: "Gilang Pratama", branch: "Cabang Menteng", specialization: "Undercut, Buzz Cut", rating: 4.7, status: "Aktif", initials: "GP" },
  { id: 3, name: "Hendra Kurniawan", branch: "Cabang Kemang", specialization: "Classic, Taper", rating: 4.8, status: "Aktif", initials: "HK" },
  { id: 4, name: "Irfan Maulana", branch: "Cabang BSD", specialization: "Mullet, Textured Crop", rating: 4.5, status: "Cuti", initials: "IM" },
]

export default function BarbersPage() {
  const [barbers] = useState(initialBarbers)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbers</h1>
          <p className="text-sm text-muted-foreground">Kelola data barber</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Barber
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barbers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px]">{b.initials}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.branch}</TableCell>
                  <TableCell className="text-muted-foreground">{b.specialization}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {b.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "Aktif" ? "success" : "warning"}>{b.status}</Badge>
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
            <DialogTitle>Tambah Barber</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input placeholder="Nama barber" />
            </div>
            <div className="grid gap-2">
              <Label>Cabang</Label>
              <Select>
                <SelectOption value="">Pilih cabang</SelectOption>
                <SelectOption value="kemang">Cabang Kemang</SelectOption>
                <SelectOption value="menteng">Cabang Menteng</SelectOption>
                <SelectOption value="bsd">Cabang BSD</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Spesialisasi</Label>
              <Input placeholder="Fade, Pompadour, dll" />
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
